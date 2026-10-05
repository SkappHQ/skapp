import { DateTime } from "luxon";

import { daysTypes } from "~community/common/constants/stringConstants";
import { LeaveStates } from "~community/common/types/CommonTypes";
import {
  getHolidaysForDay,
  isNotAWorkingDate
} from "~community/common/utils/calendarDateRangePickerUtils";
import { formatDateTimeWithOrdinalIndicatorWithoutYear } from "~community/common/utils/dateTimeUtils";
import { Holiday } from "~community/people/types/HolidayTypes";

interface GetDurationProps {
  leaveState: LeaveStates;
  translateText: (key: string[]) => string;
  workingDays: daysTypes[];
  allHolidays: Holiday[] | undefined;
  startDate: DateTime;
  endDate?: DateTime;
}

export const getDuration = ({
  leaveState,
  translateText,
  workingDays,
  allHolidays,
  startDate,
  endDate
}: GetDurationProps) => {
  if (!endDate) {
    return getDefaultDurationText(leaveState, translateText);
  }

  const workingDayCount = calculateWorkingDays({
    workingDays,
    allHolidays,
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
  allHolidays,
  startDate,
  endDate
}: {
  workingDays: daysTypes[];
  allHolidays: Holiday[] | undefined;
  startDate: DateTime;
  endDate: DateTime;
}): number => {
  if (!allHolidays) return 0;

  let noOfWorkingDays = 0;
  let currentDate = startDate.startOf("day");
  const lastDate = endDate.startOf("day");

  while (currentDate <= lastDate) {
    const isHoliday = !!getHolidaysForDay({ allHolidays, date: currentDate })
      ?.length;

    const isWorkingDay = !isNotAWorkingDate({
      date: currentDate,
      workingDays
    });

    if (!isHoliday && isWorkingDay) {
      noOfWorkingDays++;
    }

    currentDate = currentDate.plus({ days: 1 });
  }

  return noOfWorkingDays;
};

export const getLeavePeriod = (startDate: DateTime, endDate?: DateTime) => {
  if (endDate) {
    return `${formatDateTimeWithOrdinalIndicatorWithoutYear(startDate)} - ${formatDateTimeWithOrdinalIndicatorWithoutYear(endDate)}`;
  }

  return formatDateTimeWithOrdinalIndicatorWithoutYear(startDate);
};
