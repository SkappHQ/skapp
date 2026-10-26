import { DateTime } from "luxon";

import { daysTypes } from "~community/common/constants/stringConstants";
import {
  DATE_FORMAT,
  daysOfWeek
} from "~community/common/constants/timeConstants";
import { nowInZone } from "~community/common/utils/dateTimeUtils";
import {
  ACTIVITY_DATE_PRESETS,
  ACTIVITY_LAST_DAYS_PRESET_LENGTH
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityDatePreset,
  ActivityDateRange,
  ActivityFeedFilters
} from "~community/crm/activities/types/activityTypes";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

const formatDateValue = (dateTime: DateTime): string =>
  dateTime.toFormat(DATE_FORMAT);

const parseDateValue = (value: string): DateTime =>
  DateTime.fromFormat(value, DATE_FORMAT);

export const validateDateRange = (range: ActivityDateRange): boolean => {
  if (!range.fromDate || !range.toDate) return true;

  const from = parseDateValue(range.fromDate);
  const to = parseDateValue(range.toDate);

  if (!from.isValid || !to.isValid) return false;

  return to.toMillis() >= from.toMillis();
};

export const toPickerDateRange = (range: ActivityDateRange) => ({
  ...(range.fromDate
    ? { from: parseDateValue(range.fromDate).toJSDate() }
    : {}),
  ...(range.toDate ? { to: parseDateValue(range.toDate).toJSDate() } : {})
});

export const toDateValue = (date: Date): string =>
  formatDateValue(DateTime.fromJSDate(date));

const toRange = (from: DateTime, to: DateTime): ActivityDateRange => ({
  fromDate: formatDateValue(from),
  toDate: formatDateValue(to)
});

const getStartOfWeek = (today: DateTime, weekStartDay: daysTypes): DateTime => {
  const weekStartWeekday =
    daysOfWeek.findIndex((day) => day.toUpperCase() === weekStartDay) + 1;

  return today.minus({ days: (today.weekday - weekStartWeekday + 7) % 7 });
};

export const getPresetDateRange = (
  preset: ActivityDatePreset,
  weekStartDay: daysTypes,
  zone?: string
): ActivityDateRange => {
  const today = nowInZone(zone).startOf("day");

  switch (preset) {
    case ActivityDatePreset.TODAY:
      return toRange(today, today);
    case ActivityDatePreset.THIS_WEEK: {
      const weekStart = getStartOfWeek(today, weekStartDay);

      return toRange(weekStart, weekStart.plus({ days: 6 }));
    }
    case ActivityDatePreset.THIS_MONTH:
      return toRange(today.startOf("month"), today.endOf("month"));
    case ActivityDatePreset.LAST_30_DAYS:
      return toRange(
        today.minus({ days: ACTIVITY_LAST_DAYS_PRESET_LENGTH - 1 }),
        today
      );
  }
};

const isSameDateRange = (
  first: ActivityDateRange,
  second: ActivityDateRange
): boolean =>
  first.fromDate === second.fromDate && first.toDate === second.toDate;

export const getMatchingPreset = (
  range: ActivityDateRange,
  weekStartDay: daysTypes,
  zone?: string
): ActivityDatePreset | null => {
  if (!range.fromDate || !range.toDate) return null;

  const match = ACTIVITY_DATE_PRESETS.find((preset) =>
    isSameDateRange(getPresetDateRange(preset.id, weekStartDay, zone), range)
  );

  return match ? match.id : null;
};

export const areFilterValuesEqual = (
  first: ActivityFeedFilters,
  second: ActivityFeedFilters
): boolean =>
  first.ownerId === second.ownerId && isSameDateRange(first, second);

export const countActiveFilters = (filters: ActivityFeedFilters): number => {
  const isOwnerActive = Boolean(filters.ownerId);
  const isDateRangeActive = Boolean(filters.fromDate || filters.toDate);

  return Number(isOwnerActive) + Number(isDateRangeActive);
};

export const hasActiveFilters = (filters: ActivityFeedFilters): boolean =>
  countActiveFilters(filters) > 0;

export const filterTeamMembers = (
  members: CrmOwnerEntity[],
  searchTerm: string
): CrmOwnerEntity[] => {
  const term = searchTerm.trim().toLowerCase();

  if (!term) return members;

  return members.filter((member) =>
    [member.firstName, member.lastName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
};
