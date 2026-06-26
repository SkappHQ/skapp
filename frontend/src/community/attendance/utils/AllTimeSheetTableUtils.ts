import {
  ManagerTimesheetHeaderType,
  TimeRecordDataResponseType
} from "~community/attendance/types/timeSheetTypes";
import { HTMLTableHeaderTypes } from "~community/common/types/CommonTypes";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { convertToYYYYMMDDFromDate } from "~community/common/utils/dateTimeUtils";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

export const getBorderClassName = (
  isHoliday: boolean,
  duration?: LeaveStates | HolidayDurationType | null
): string => {
  if (!duration) return "";

  if (isHoliday) {
    switch (duration) {
      case HolidayDurationType.HALFDAY_MORNING:
        return "half-day-morning-border";
      case HolidayDurationType.HALFDAY_EVENING:
        return "half-day-evening-border";
      case HolidayDurationType.FULLDAY:
        return "full-day-border";
      default:
        return "";
    }
  }

  switch (duration) {
    case LeaveStates.MORNING:
      return "half-day-morning-border";
    case LeaveStates.EVENING:
      return "half-day-evening-border";
    case LeaveStates.FULL_DAY:
      return "full-day-border";
    default:
      return "";
  }
};

export const getHolidayDurationType = (
  holiday: Holiday[]
): HolidayDurationType | null => {
  if (!holiday || holiday.length === 0) return null;

  let hasMorning = false;
  let hasEvening = false;

  for (const h of holiday) {
    if (h.holidayDuration === HolidayDurationType.FULLDAY) {
      return HolidayDurationType.FULLDAY;
    }
    if (h.holidayDuration === HolidayDurationType.HALFDAY_MORNING) {
      hasMorning = true;
    }
    if (h.holidayDuration === HolidayDurationType.HALFDAY_EVENING) {
      hasEvening = true;
    }
  }

  if (hasMorning && hasEvening) {
    return HolidayDurationType.FULLDAY;
  }

  if (hasMorning) {
    return HolidayDurationType.HALFDAY_MORNING;
  }

  if (hasEvening) {
    return HolidayDurationType.HALFDAY_EVENING;
  }

  return null;
};

const getDurationText = (duration?: HolidayDurationType): string => {
  if (!duration) return "";

  switch (duration) {
    case HolidayDurationType.HALFDAY_MORNING:
      return "Half Day (Morning)";
    case HolidayDurationType.HALFDAY_EVENING:
      return "Half Day (Evening)";
    case HolidayDurationType.FULLDAY:
      return "Full Day";
    default:
      return "";
  }
};

export const getHeadersWithSubtitles = ({
  translateText,
  recordData,
  getHolidaysArrayByDate
}: {
  translateText: (keys: string[]) => string;
  recordData?: TimeRecordDataResponseType;
  getHolidaysArrayByDate: (date: Date) => Holiday[];
}): HTMLTableHeaderTypes[] => {
  const baseColumns = [
    {
      id: "name",
      label: translateText(["nameHeaderTxt"]),
      sticky: true
    }
  ];

  if (
    recordData !== undefined &&
    recordData?.headerList !== undefined &&
    recordData?.headerList?.length > 0
  ) {
    const columns = recordData.headerList.map(
      (header: ManagerTimesheetHeaderType) => {
        const holiday = getHolidaysArrayByDate(header.headerDateObject) || [];

        const isHoliday = holiday.length > 0;

        const holidayDuration = getHolidayDurationType(holiday);

        const subtitleText = isHoliday
          ? ` ${translateText(["holiday"])} ${getDurationText(holiday[0]?.holidayDuration)}`
          : "";

        const ariaLabel = `${header.headerDate?.toUpperCase() ?? ""}${subtitleText}`;

        return {
          id: convertToYYYYMMDDFromDate(header.headerDateObject),
          ariaLabel: ariaLabel,
          label: header.headerDate?.toUpperCase(),
          sticky: false,
          subtitle: {
            isChip: isHoliday,
            text: isHoliday ? translateText(["holiday"]) : "",
            emoji: isHoliday ? "1f3d6-fe0f" : "",
            duration: isHoliday ? holidayDuration : undefined
          }
        };
      }
    );

    return [...baseColumns, ...columns];
  }

  return baseColumns;
};
