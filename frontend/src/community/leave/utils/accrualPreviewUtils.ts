import { DateTime, DurationLike } from "luxon";

import {
  ACCRUAL_PREVIEW_ROW_LIMIT,
  CALENDAR_UNIT,
  INTERVAL_STEP
} from "~community/leave/constants/leavePolicyConstants";
import {
  AccrualEvent,
  AccrualPreviewRow,
  AccrualTiming,
  CalendarUnit,
  FirstAccrualType,
  LeavePolicyType,
  ScheduleConfig
} from "~community/leave/types/LeavePolicyTypes";

const roundToTwoDecimals = (value: number): number =>
  Math.round(value * 100) / 100;

const eventDateFor = (
  atPeriodStart: boolean,
  isFirstPeriod: boolean,
  base: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime
): DateTime => {
  if (!atPeriodStart) return periodEnd;
  return isFirstPeriod ? base : periodStart;
};

const firstPeriodDays = (
  perPeriod: number,
  base: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime,
  calendarUnit: CalendarUnit
): number => {
  const fullPeriodDays =
    periodEnd.diff(periodStart.startOf(calendarUnit), "days").days + 1;
  const coveredDays = periodEnd.diff(base, "days").days + 1;
  const coverageFraction =
    fullPeriodDays > 0
      ? Math.min(1, Math.max(0, coveredDays / fullPeriodDays))
      : 1;
  return roundToTwoDecimals(perPeriod * coverageFraction);
};

const calendarEvents = (
  calendarUnit: CalendarUnit,
  config: ScheduleConfig
): AccrualEvent[] => {
  const { base, perPeriod, prorateFirst, atPeriodStart, lastYear } = config;
  const events: AccrualEvent[] = [];
  let periodStart = base;
  let periodEnd = base.endOf(calendarUnit);

  for (
    let periodIndex = 0;
    periodIndex < ACCRUAL_PREVIEW_ROW_LIMIT;
    periodIndex++
  ) {
    const isFirstPeriod = periodIndex === 0;
    const eventDate = eventDateFor(
      atPeriodStart,
      isFirstPeriod,
      base,
      periodStart,
      periodEnd
    );
    if (lastYear != null && eventDate.year > lastYear) break;
    const eventDays =
      isFirstPeriod && prorateFirst
        ? firstPeriodDays(perPeriod, base, periodStart, periodEnd, calendarUnit)
        : perPeriod;
    events.push({ date: eventDate, days: eventDays });
    periodStart = periodEnd.plus({ days: 1 }).startOf(calendarUnit);
    periodEnd = periodStart.endOf(calendarUnit);
  }
  return events;
};

const intervalEvents = (
  interval: DurationLike,
  config: ScheduleConfig
): AccrualEvent[] => {
  const { base, perPeriod, atPeriodStart, lastYear } = config;
  const events: AccrualEvent[] = [];
  let periodStart = base;

  for (
    let periodIndex = 0;
    periodIndex < ACCRUAL_PREVIEW_ROW_LIMIT;
    periodIndex++
  ) {
    const nextPeriodStart = periodStart.plus(interval);
    const eventDate = atPeriodStart
      ? periodStart
      : nextPeriodStart.minus({ days: 1 });
    if (lastYear != null && eventDate.year > lastYear) break;
    events.push({ date: eventDate, days: perPeriod });
    periodStart = nextPeriodStart;
  }
  return events;
};

const toRows = (
  events: AccrualEvent[],
  capDays: number | null
): AccrualPreviewRow[] => {
  const rows: AccrualPreviewRow[] = [];
  let balance = 0;
  for (const event of events) {
    balance = roundToTwoDecimals(balance + event.days);
    if (capDays != null) balance = Math.min(balance, capDays);
    rows.push({
      date: event.date.toFormat("dd MMM yyyy"),
      days: roundToTwoDecimals(event.days),
      balance
    });
    if (capDays != null && balance >= capDays) break;
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

  const startDate = (
    startISO ? DateTime.fromISO(startISO) : DateTime.now()
  ).startOf("day");
  if (!startDate.isValid) return [];

  const config: ScheduleConfig = {
    base:
      policy.waitingPeriodDays && policy.waitingPeriodDays > 0
        ? startDate.plus({ days: policy.waitingPeriodDays })
        : startDate,
    perPeriod,
    prorateFirst: policy.firstAccrual === FirstAccrualType.PRORATED,
    atPeriodStart: policy.accrualTiming === AccrualTiming.PERIOD_START,
    lastYear: policy.isCarryoverEnabled ? null : startDate.year
  };

  const capDays =
    policy.accrualCapDays && policy.accrualCapDays > 0
      ? policy.accrualCapDays
      : null;

  const calendarUnit = CALENDAR_UNIT[frequency];
  const events = calendarUnit
    ? calendarEvents(calendarUnit, config)
    : intervalEvents(INTERVAL_STEP[frequency] ?? { months: 1 }, config);

  return toRows(events, capDays);
};
