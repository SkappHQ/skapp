import { DateTime, DurationLike } from "luxon";

import { MEDIUM_DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  ACCRUAL_PREVIEW_ROW_LIMIT,
  CALENDAR_UNIT,
  INTERVAL_STEP
} from "~community/leave/constants/leavePolicyConstants";
import {
  AccrualPreviewRow,
  AccrualTiming,
  CalendarUnit,
  FirstAccrualType,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface AccrualEvent {
  date: DateTime;
  days: number;
}

interface ScheduleConfig {
  accrualStartDate: DateTime;
  perPeriod: number;
  isFirstPeriodProrated: boolean;
  isAtPeriodStart: boolean;
  lastYear: number | null;
}

const roundToHalfDay = (value: number): number => Math.round(value * 2) / 2;

const eventDateFor = (
  isAtPeriodStart: boolean,
  isFirstPeriod: boolean,
  accrualStartDate: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime
): DateTime => {
  if (!isAtPeriodStart) return periodEnd;
  return isFirstPeriod ? accrualStartDate : periodStart;
};

const firstPeriodDays = (
  perPeriod: number,
  accrualStartDate: DateTime,
  periodStart: DateTime,
  periodEnd: DateTime,
  calendarUnit: CalendarUnit
): number => {
  const fullPeriodDays =
    periodEnd.diff(periodStart.startOf(calendarUnit), "days").days + 1;
  const coveredDays = periodEnd.diff(accrualStartDate, "days").days + 1;
  const coverageFraction =
    fullPeriodDays > 0
      ? Math.min(1, Math.max(0, coveredDays / fullPeriodDays))
      : 1;
  return perPeriod * coverageFraction;
};

const calendarEvents = (
  calendarUnit: CalendarUnit,
  config: ScheduleConfig
): AccrualEvent[] => {
  const {
    accrualStartDate,
    perPeriod,
    isFirstPeriodProrated,
    isAtPeriodStart,
    lastYear
  } = config;
  const accrualEvents: AccrualEvent[] = [];
  let periodStart = accrualStartDate;
  let periodEnd = accrualStartDate.endOf(calendarUnit);

  for (
    let periodIndex = 0;
    periodIndex < ACCRUAL_PREVIEW_ROW_LIMIT;
    periodIndex++
  ) {
    const isFirstPeriod = periodIndex === 0;
    const eventDate = eventDateFor(
      isAtPeriodStart,
      isFirstPeriod,
      accrualStartDate,
      periodStart,
      periodEnd
    );
    if (lastYear != null && eventDate.year > lastYear) break;
    const eventDays =
      isFirstPeriod && isFirstPeriodProrated
        ? firstPeriodDays(
            perPeriod,
            accrualStartDate,
            periodStart,
            periodEnd,
            calendarUnit
          )
        : perPeriod;
    accrualEvents.push({ date: eventDate, days: eventDays });
    periodStart = periodEnd.plus({ days: 1 }).startOf(calendarUnit);
    periodEnd = periodStart.endOf(calendarUnit);
  }
  return accrualEvents;
};

const intervalEvents = (
  interval: DurationLike,
  config: ScheduleConfig
): AccrualEvent[] => {
  const { accrualStartDate, perPeriod, isAtPeriodStart, lastYear } = config;
  const accrualEvents: AccrualEvent[] = [];
  let periodStart = accrualStartDate;

  for (
    let periodIndex = 0;
    periodIndex < ACCRUAL_PREVIEW_ROW_LIMIT;
    periodIndex++
  ) {
    const nextPeriodStart = periodStart.plus(interval);
    const eventDate = isAtPeriodStart
      ? periodStart
      : nextPeriodStart.minus({ days: 1 });
    if (lastYear != null && eventDate.year > lastYear) break;
    accrualEvents.push({ date: eventDate, days: perPeriod });
    periodStart = nextPeriodStart;
  }
  return accrualEvents;
};

const toPreviewRows = (
  accrualEvents: AccrualEvent[],
  capDays: number | null
): AccrualPreviewRow[] => {
  const rows: AccrualPreviewRow[] = [];
  let balance = 0;
  let previousRoundedBalance = 0;
  for (const event of accrualEvents) {
    balance += event.days;
    if (capDays != null) balance = Math.min(balance, capDays);
    const roundedBalance = roundToHalfDay(balance);
    rows.push({
      date: event.date.toFormat(MEDIUM_DATE_FORMAT),
      days: roundedBalance - previousRoundedBalance,
      balance: roundedBalance
    });
    previousRoundedBalance = roundedBalance;
    if (capDays != null && balance >= capDays) break;
  }
  return rows;
};

export const buildAccrualPreview = (
  policy: LeavePolicyType,
  startISO?: string
): AccrualPreviewRow[] => {
  const perPeriod = policy.accrualDays;
  const frequency = policy.frequency;
  if (!frequency || !perPeriod || perPeriod <= 0) return [];

  const startDate = (
    startISO ? DateTime.fromISO(startISO) : DateTime.now()
  ).startOf("day");
  if (!startDate.isValid) return [];

  const accrualStartDate =
    policy.waitingPeriodDays && policy.waitingPeriodDays > 0
      ? startDate.plus({ days: policy.waitingPeriodDays })
      : startDate;

  const config: ScheduleConfig = {
    accrualStartDate,
    perPeriod,
    isFirstPeriodProrated: policy.firstAccrual === FirstAccrualType.PRORATED,
    isAtPeriodStart: policy.accrualTiming === AccrualTiming.PERIOD_START,
    lastYear: policy.isCarryoverEnabled ? null : accrualStartDate.year
  };

  const capDays =
    policy.accrualCapDays && policy.accrualCapDays > 0
      ? policy.accrualCapDays
      : null;

  const calendarUnit = CALENDAR_UNIT[frequency];
  const accrualEvents = calendarUnit
    ? calendarEvents(calendarUnit, config)
    : intervalEvents(INTERVAL_STEP[frequency] ?? { months: 1 }, config);

  return toPreviewRows(accrualEvents, capDays);
};
