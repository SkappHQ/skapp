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

// Frequencies without a native calendar unit fall back to fixed intervals.
const INTERVAL_STEP: Partial<Record<AccrualFrequency, DurationLike>> = {
  EVERY_OTHER_WEEK: { weeks: 2 },
  TWICE_A_MONTH: { days: 15 },
  TWICE_A_YEAR: { months: 6 }
};

interface AccrualEvent {
  date: DateTime;
  days: number;
}

interface ScheduleConfig {
  base: DateTime;
  perPeriod: number;
  prorateFirst: boolean;
  atPeriodStart: boolean;
  // When set (carry-over disabled), stop projecting after this year.
  lastYear: number | null;
}

const eventDateFor = (
  atPeriodStart: boolean,
  isFirst: boolean,
  base: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime
): DateTime => {
  if (!atPeriodStart) return periodEnd;
  return isFirst ? base : periodStart;
};

// Prorated days for the first (partial) calendar period.
const firstPeriodDays = (
  perPeriod: number,
  base: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime,
  unit: CalendarUnit
): number => {
  const fullLength = periodEnd.diff(periodStart.startOf(unit), "days").days + 1;
  const covered = periodEnd.diff(base, "days").days + 1;
  const fraction =
    fullLength > 0 ? Math.min(1, Math.max(0, covered / fullLength)) : 1;
  return round2(perPeriod * fraction);
};

// One "Accrued" event per calendar period, prorating the first partial one.
const calendarEvents = (
  unit: CalendarUnit,
  config: ScheduleConfig
): AccrualEvent[] => {
  const { base, perPeriod, prorateFirst, atPeriodStart, lastYear } = config;
  const events: AccrualEvent[] = [];
  let periodStart = base;
  let periodEnd = base.endOf(unit);

  for (let i = 0; i < PREVIEW_ROW_LIMIT; i++) {
    const eventDate = eventDateFor(
      atPeriodStart,
      i === 0,
      base,
      periodStart,
      periodEnd
    );
    if (lastYear != null && eventDate.year > lastYear) break;
    const days =
      i === 0 && prorateFirst
        ? firstPeriodDays(perPeriod, base, periodStart, periodEnd, unit)
        : perPeriod;
    events.push({ date: eventDate, days });
    periodStart = periodEnd.plus({ days: 1 }).startOf(unit);
    periodEnd = periodStart.endOf(unit);
  }
  return events;
};

// One "Accrued" event per fixed interval from the effective date.
const intervalEvents = (
  interval: DurationLike,
  config: ScheduleConfig
): AccrualEvent[] => {
  const { base, perPeriod, atPeriodStart, lastYear } = config;
  const events: AccrualEvent[] = [];
  let cursor = base;

  for (let i = 0; i < PREVIEW_ROW_LIMIT; i++) {
    const next = cursor.plus(interval);
    const eventDate = atPeriodStart ? cursor : next.minus({ days: 1 });
    if (lastYear != null && eventDate.year > lastYear) break;
    events.push({ date: eventDate, days: perPeriod });
    cursor = next;
  }
  return events;
};

// Accumulate a running balance, capped at accrualCapDays.
const toRows = (
  events: AccrualEvent[],
  cap: number | null
): AccrualPreviewRow[] => {
  const rows: AccrualPreviewRow[] = [];
  let balance = 0;
  for (const event of events) {
    balance = round2(balance + event.days);
    if (cap != null) balance = Math.min(balance, cap);
    rows.push({
      date: event.date.toFormat("dd MMM yyyy"),
      days: round2(event.days),
      balance
    });
    if (cap != null && balance >= cap) break;
  }
  return rows;
};

/**
 * Projects the accrual schedule for an ACCRUAL policy entirely on the frontend:
 * one "Accrued" event per frequency period, adding accrualDays each time and
 * running a balance capped at accrualCapDays. The first period is prorated when
 * firstAccrual is PRORATED, the event date follows accrualTiming, and — without
 * carry-over — the projection stops at the effective-date's year. Illustrative,
 * not the authoritative server-side calculation.
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

  const config: ScheduleConfig = {
    base:
      policy.waitingPeriodDays && policy.waitingPeriodDays > 0
        ? start.plus({ days: policy.waitingPeriodDays })
        : start,
    perPeriod,
    prorateFirst: policy.firstAccrual === FirstAccrualType.PRORATED,
    atPeriodStart: policy.accrualTiming === AccrualTiming.PERIOD_START,
    lastYear: policy.isCarryoverEnabled ? null : start.year
  };

  const cap =
    policy.accrualCapDays && policy.accrualCapDays > 0
      ? policy.accrualCapDays
      : null;

  const unit = CALENDAR_UNIT[frequency];
  const events = unit
    ? calendarEvents(unit, config)
    : intervalEvents(INTERVAL_STEP[frequency] ?? { months: 1 }, config);

  return toRows(events, cap);
};
