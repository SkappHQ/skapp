import { DateTime } from "luxon";

import { nowInZone } from "~community/common/utils/dateTimeUtils";
import {
  ACTIVITY_DATE_FORMAT,
  ACTIVITY_DATE_PRESETS,
  ACTIVITY_LAST_DAYS_PRESET_LENGTH
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityDatePreset,
  ActivityFilterValues,
  ActivityTeamMember,
  DateRange
} from "~community/crm/activities/types/activityTypes";

const formatDateValue = (dateTime: DateTime): string =>
  dateTime.toFormat(ACTIVITY_DATE_FORMAT);

const toRange = (from: DateTime, to: DateTime): DateRange => ({
  from: formatDateValue(from),
  to: formatDateValue(to)
});

export const getPresetDateRange = (
  preset: ActivityDatePreset,
  zone?: string
): DateRange => {
  const today = nowInZone(zone).startOf("day");

  switch (preset) {
    case ActivityDatePreset.TODAY:
      return toRange(today, today);
    case ActivityDatePreset.THIS_WEEK:
      return toRange(today.startOf("week"), today.endOf("week"));
    case ActivityDatePreset.THIS_MONTH:
      return toRange(today.startOf("month"), today.endOf("month"));
    case ActivityDatePreset.LAST_30_DAYS:
      return toRange(
        today.minus({ days: ACTIVITY_LAST_DAYS_PRESET_LENGTH - 1 }),
        today
      );
  }
};

const isSameDateRange = (first: DateRange, second: DateRange): boolean =>
  first.from === second.from && first.to === second.to;

export const getMatchingPreset = (
  range: DateRange,
  zone?: string
): ActivityDatePreset | null => {
  if (!range.from || !range.to) return null;

  const match = ACTIVITY_DATE_PRESETS.find((preset) =>
    isSameDateRange(getPresetDateRange(preset.id, zone), range)
  );

  return match ? match.id : null;
};

export const areFilterValuesEqual = (
  first: ActivityFilterValues,
  second: ActivityFilterValues
): boolean =>
  first.ownerId === second.ownerId &&
  isSameDateRange(first.dateRange, second.dateRange);

export const countActiveFilters = (filters: ActivityFilterValues): number => {
  const isOwnerActive = filters.ownerId !== null;
  const isDateRangeActive =
    filters.dateRange.from !== null || filters.dateRange.to !== null;

  return Number(isOwnerActive) + Number(isDateRangeActive);
};

export const hasActiveFilters = (filters: ActivityFilterValues): boolean =>
  countActiveFilters(filters) > 0;

export const filterTeamMembers = (
  members: ActivityTeamMember[],
  searchTerm: string
): ActivityTeamMember[] => {
  const term = searchTerm.trim().toLowerCase();

  if (!term) return members;

  return members.filter((member) => member.name.toLowerCase().includes(term));
};
