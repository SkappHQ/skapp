import { DateTime, DurationLike } from "luxon";

import {
  AccrualFrequency,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

export interface AccrualPreviewRow {
  date: string;
  days: number;
  balance: number;
}

// Cap the projection to a readable window inside the modal.
const PREVIEW_ROW_LIMIT = 12;

const round2 = (value: number): number => Math.round(value * 100) / 100;

type CalendarUnit = "day" | "week" | "month" | "quarter" | "year";

// Frequencies that align onto a luxon calendar unit, so the first partial
// period can be prorated against real calendar boundaries.
const CALENDAR_UNIT: Partial<Record<AccrualFrequency, CalendarUnit>> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
  ON_ANNIVERSARY: "year"
};

// Frequencies without a native calendar unit fall back to fixed intervals
// (no first-period proration).
const INTERVAL_STEP: Partial<Record<AccrualFrequency, DurationLike>> = {
  EVERY_OTHER_WEEK: { weeks: 2 },
  TWICE_A_MONTH: { days: 15 },
  TWICE_A_YEAR: { months: 6 }
};

/**
 * Projects the accrual schedule for an ACCRUAL policy entirely on the frontend:
 * one "Accrued" event per frequency period, adding accrualDays each time and
 * running a balance that is capped at accrualCapDays. The first period is
 * prorated when firstAccrual is PRORATED, and the event date follows
 * accrualTiming (period start vs end). This is an illustrative projection, not
 * the authoritative server-side calculation.
 */
export const buildAccrualPreview = (
  policy: LeavePolicyType,
  startISO: string | null
): AccrualPreviewRow[] => {
  const perPeriod = policy.accrualDays ?? 0;
  const frequency = policy.frequency ?? null;
  if (!frequency || perPeriod <= 0) return [];

  const start = (
    startISO ? DateTime.fromISO(startISO) : DateTime.now()
  ).startOf("day");
  if (!start.isValid) return [];

  const base =
    policy.waitingPeriodDays && policy.waitingPeriodDays > 0
      ? start.plus({ days: policy.waitingPeriodDays })
      : start;

  const cap =
    policy.accrualCapDays && policy.accrualCapDays > 0
      ? policy.accrualCapDays
      : null;
  const prorateFirst = policy.firstAccrual === FirstAccrualType.PRORATED;
  const atPeriodStart = policy.accrualTiming === AccrualTiming.PERIOD_START;
  // Without carry-over the balance resets at the cycle end, so don't project
  // accruals into the next year (relative to the effective date).
  const lastYear = policy.isCarryoverEnabled ? null : start.year;

  const rows: AccrualPreviewRow[] = [];
  let balance = 0;

  // Returns false once the cap is reached, so the caller can stop early.
  const addRow = (eventDate: DateTime, days: number): boolean => {
    balance = round2(balance + days);
    if (cap != null) balance = Math.min(balance, cap);
    rows.push({
      date: eventDate.toFormat("dd MMM yyyy"),
      days: round2(days),
      balance
    });
    return cap == null || balance < cap;
  };

  const unit = CALENDAR_UNIT[frequency];
  if (unit) {
    let periodStart = base;
    let periodEnd = base.endOf(unit);
    for (let i = 0; i < PREVIEW_ROW_LIMIT; i++) {
      let days = perPeriod;
      if (i === 0 && prorateFirst) {
        const fullLength =
          periodEnd.diff(periodStart.startOf(unit), "days").days + 1;
        const covered = periodEnd.diff(base, "days").days + 1;
        const fraction =
          fullLength > 0 ? Math.min(1, Math.max(0, covered / fullLength)) : 1;
        days = round2(perPeriod * fraction);
      }
      const eventDate = atPeriodStart
        ? i === 0
          ? base
          : periodStart
        : periodEnd;
      if (lastYear != null && eventDate.year > lastYear) break;
      if (!addRow(eventDate, days)) break;
      periodStart = periodEnd.plus({ days: 1 }).startOf(unit);
      periodEnd = periodStart.endOf(unit);
    }
    return rows;
  }

  const interval = INTERVAL_STEP[frequency] ?? { months: 1 };
  let cursor = base;
  for (let i = 0; i < PREVIEW_ROW_LIMIT; i++) {
    const next = cursor.plus(interval);
    const eventDate = atPeriodStart ? cursor : next.minus({ days: 1 });
    if (lastYear != null && eventDate.year > lastYear) break;
    if (!addRow(eventDate, perPeriod)) break;
    cursor = next;
  }
  return rows;
};
