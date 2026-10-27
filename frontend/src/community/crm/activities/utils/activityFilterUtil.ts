import { DateTime } from "luxon";

import {
  convertToYYYYMMDDFromDate,
  convertToYYYYMMDDFromDateTime,
  convertYYYYMMDDToDateTime,
  getStartAndEndOfCurrentWeek,
  nowInZone
} from "~community/common/utils/dateTimeUtils";
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

export const validateDateRange = (range: ActivityDateRange): boolean => {
  if (!range.fromDate || !range.toDate) return true;

  const from = convertYYYYMMDDToDateTime(range.fromDate);
  const to = convertYYYYMMDDToDateTime(range.toDate);

  if (!from.isValid || !to.isValid) return false;

  return to.toMillis() >= from.toMillis();
};

export const toPickerDateRange = (range: ActivityDateRange) => ({
  ...(range.fromDate
    ? { from: convertYYYYMMDDToDateTime(range.fromDate).toJSDate() }
    : {}),
  ...(range.toDate
    ? { to: convertYYYYMMDDToDateTime(range.toDate).toJSDate() }
    : {})
});

const toRange = (from: DateTime, to: DateTime): ActivityDateRange => ({
  fromDate: convertToYYYYMMDDFromDateTime(from),
  toDate: convertToYYYYMMDDFromDateTime(to)
});

export const getDateRangeForPreset = (
  preset: ActivityDatePreset,
  zone?: string
): ActivityDateRange => {
  const today = nowInZone(zone).startOf("day");

  switch (preset) {
    case ActivityDatePreset.TODAY:
      return toRange(today, today);
    case ActivityDatePreset.THIS_WEEK: {
      const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();

      return {
        fromDate: convertToYYYYMMDDFromDate(startOfWeek),
        toDate: convertToYYYYMMDDFromDate(endOfWeek)
      };
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
  zone?: string
): ActivityDatePreset | null => {
  if (!range.fromDate || !range.toDate) return null;

  const match = ACTIVITY_DATE_PRESETS.find((preset) =>
    isSameDateRange(getDateRangeForPreset(preset, zone), range)
  );

  return match ?? null;
};

export const areFilterValuesEqual = (
  first: ActivityFeedFilters,
  second: ActivityFeedFilters
): boolean =>
  first.ownerId === second.ownerId && isSameDateRange(first, second);

export const filterCRMEmployees = (
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
