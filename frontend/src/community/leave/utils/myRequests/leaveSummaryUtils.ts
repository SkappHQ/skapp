import { DateTime } from "luxon";

import { daysTypes } from "~community/common/constants/stringConstants";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { isNotAWorkingDate } from "~community/common/utils/calendarDateRangePickerUtils";
import {
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  isDateTimeSimilar,
  parseStringWithCurrentYearAndConvertToDateTime
} from "~community/common/utils/dateTimeUtils";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";

interface GetDurationProps {
  leaveState: LeaveStates;
  translateText: (key: string[]) => string;
  workingDays: daysTypes[];
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
  startDate: DateTime;
  endDate?: DateTime;
}

export const getDuration = ({
  leaveState,
  translateText,
  workingDays,
  resourceAvailability,
  startDate,
  endDate
}: GetDurationProps) => {
  if (!endDate) {
    return getDefaultDurationText(leaveState, translateText);
  }

  const workingDayCount = calculateWorkingDays({
    workingDays,
    resourceAvailability,
    startDate,
    endDate
  });

  if (workingDayCount > 1) {
    return `${workingDayCount} ${translateText(["days"])}`;
  }

  return getDefaultDurationText(leaveState, translateText);
};

export const getDefaultDurationText = (
  leaveState: LeaveStates,
  translateText: (key: string[]) => string
): string => {
  switch (leaveState) {
    case LeaveStates.FULL_DAY:
      return translateText(["fullDay"]);
    case LeaveStates.MORNING:
      return translateText(["halfDayMorning"]);
    case LeaveStates.EVENING:
      return translateText(["halfDayEvening"]);
    default:
      return "";
  }
};

export const calculateWorkingDays = ({
  workingDays,
  resourceAvailability,
  startDate,
  endDate
}: {
  workingDays: daysTypes[];
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
  startDate: DateTime;
  endDate: DateTime;
}): number => {
  if (!resourceAvailability) return 0;

  const requestingDays = resourceAvailability.filter((resource) => {
    const resourceDate = parseStringWithCurrentYearAndConvertToDateTime(
      resource.date
    );

    if (!endDate) {
      return isDateTimeSimilar(startDate, resourceDate);
    }

    return startDate <= resourceDate && resourceDate <= endDate;
  });

  const workingDaysWithoutHolidays = requestingDays.filter(
    (day) => day.holidays.length === 0
  );

  const noOfWorkingDays = workingDaysWithoutHolidays.reduce((count, day) => {
    const date = parseStringWithCurrentYearAndConvertToDateTime(day.date);

    const isWorkingDay = !isNotAWorkingDate({
      date,
      workingDays
    });

    return isWorkingDay ? count + 1 : count;
  }, 0);

  return noOfWorkingDays;
};

export const getLeavePeriod = (startDate: DateTime, endDate?: DateTime) => {
  if (endDate) {
    return `${formatDateTimeWithOrdinalIndicatorWithoutYear(startDate)} - ${formatDateTimeWithOrdinalIndicatorWithoutYear(endDate)}`;
  }

  return formatDateTimeWithOrdinalIndicatorWithoutYear(startDate);
};
