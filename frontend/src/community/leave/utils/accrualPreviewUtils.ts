import { DateTime } from "luxon";

import { MEDIUM_DATE_FORMAT } from "~community/common/constants/timeConstants";
import { ACCRUAL_PREVIEW_ROW_LIMIT } from "~community/leave/constants/leavePolicyConstants";
import {
  AccrualFrequency,
  AccrualPreviewRow,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface AccrualEvent {
  date: DateTime;
  days: number;
}

interface AccrualPeriod {
  start: DateTime;
  end: DateTime;
}

interface ScheduleConfig {
  accrualStartDate: DateTime;
  perPeriod: number;
  isFirstPeriodProrated: boolean;
  isAtPeriodStart: boolean;
  lastYear: number | null;
}

const roundToHalfDay = (value: number): number => Math.round(value * 2) / 2;

const toPeriod = (start: DateTime, end: DateTime): AccrualPeriod => ({
  start,
  end
});

const periodContaining = (
  frequency: AccrualFrequency,
  accrualStartDate: DateTime,
  date: DateTime
): AccrualPeriod => {
  switch (frequency) {
    case AccrualFrequency.DAILY:
      return toPeriod(date, date);
    case AccrualFrequency.WEEKLY: {
      const start = date.startOf("week");
      return toPeriod(start, start.plus({ weeks: 1 }).minus({ days: 1 }));
    }
    case AccrualFrequency.EVERY_OTHER_WEEK: {
      const anchor = accrualStartDate.startOf("week");
      const weeksElapsed = Math.floor(date.diff(anchor, "weeks").weeks);
      const start = anchor.plus({ weeks: weeksElapsed - (weeksElapsed % 2) });
      return toPeriod(start, start.plus({ weeks: 2 }).minus({ days: 1 }));
    }
    case AccrualFrequency.TWICE_A_MONTH:
      return date.day <= 15
        ? toPeriod(date.set({ day: 1 }), date.set({ day: 15 }))
        : toPeriod(date.set({ day: 16 }), date.endOf("month").startOf("day"));
    case AccrualFrequency.MONTHLY:
      return toPeriod(
        date.startOf("month"),
        date.endOf("month").startOf("day")
      );
    case AccrualFrequency.QUARTERLY: {
      const start = date.startOf("quarter");
      return toPeriod(start, start.plus({ months: 3 }).minus({ days: 1 }));
    }
    case AccrualFrequency.TWICE_A_YEAR: {
      const start = date.set({ month: date.month <= 6 ? 1 : 7, day: 1 });
      return toPeriod(start, start.plus({ months: 6 }).minus({ days: 1 }));
    }
    case AccrualFrequency.YEARLY:
      return toPeriod(date.startOf("year"), date.endOf("year").startOf("day"));
    case AccrualFrequency.ON_ANNIVERSARY: {
      const yearsElapsed = Math.floor(
        date.diff(accrualStartDate, "years").years
      );
      return toPeriod(
        accrualStartDate.plus({ years: yearsElapsed }),
        accrualStartDate.plus({ years: yearsElapsed + 1 }).minus({ days: 1 })
      );
    }
  }
};

const proration = (
  period: AccrualPeriod,
  accrualStartDate: DateTime
): number => {
  if (accrualStartDate.toMillis() <= period.start.toMillis()) return 1;
  const periodLength = period.end.diff(period.start, "days").days + 1;
  const earnedLength = period.end.diff(accrualStartDate, "days").days + 1;
  if (periodLength <= 0 || earnedLength <= 0) return 0;
  return earnedLength / periodLength;
};

const accrualEventsFor = (
  frequency: AccrualFrequency,
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
  let period = periodContaining(frequency, accrualStartDate, accrualStartDate);

  for (
    let periodIndex = 0;
    periodIndex < ACCRUAL_PREVIEW_ROW_LIMIT;
    periodIndex++
  ) {
    const isFirstPeriod = periodIndex === 0;
    const creditDate = isAtPeriodStart ? period.start : period.end;
    const eventDate =
      creditDate.toMillis() < accrualStartDate.toMillis()
        ? accrualStartDate
        : creditDate;
    if (lastYear != null && eventDate.year > lastYear) break;
    const eventDays =
      isFirstPeriod && isFirstPeriodProrated
        ? perPeriod * proration(period, accrualStartDate)
        : perPeriod;
    accrualEvents.push({ date: eventDate, days: eventDays });

    const nextPeriod = periodContaining(
      frequency,
      accrualStartDate,
      period.end.plus({ days: 1 })
    );
    if (nextPeriod.start.toMillis() <= period.start.toMillis()) break;
    period = nextPeriod;
  }
  return accrualEvents;
};

const toPreviewRows = (
  accrualEvents: AccrualEvent[],
  capDays: number | null
): AccrualPreviewRow[] => {
  const rows: AccrualPreviewRow[] = [];
  let cycleYear: number | null = null;
  let balance = 0;
  let previousRoundedBalance = 0;
  for (const event of accrualEvents) {
    if (cycleYear != null && event.date.year !== cycleYear) {
      balance = 0;
      previousRoundedBalance = 0;
    }
    cycleYear = event.date.year;
    balance += event.days;
    const halfDayBalance = roundToHalfDay(balance);
    const roundedBalance =
      capDays != null ? Math.min(halfDayBalance, capDays) : halfDayBalance;
    rows.push({
      date: event.date.toFormat(MEDIUM_DATE_FORMAT),
      days: roundedBalance - previousRoundedBalance,
      balance: roundedBalance
    });
    previousRoundedBalance = roundedBalance;
    if (capDays != null && roundedBalance >= capDays) break;
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

  return toPreviewRows(accrualEventsFor(frequency, config), capDays);
};
