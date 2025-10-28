import { DateTime } from "luxon";

import { LeaveStates } from "~community/common/types/CommonTypes";
import { isNotAWorkingDate } from "~community/common/utils/calendarDateRangePickerUtils";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

export const getHolidayClasses = (holidays: Holiday[] | null): string => {
  const holidayClasses = holidays?.map((holiday) => {
    switch (holiday?.holidayDuration) {
      case HolidayDurationType.FULLDAY:
        return "Mui-full-day-holiday";
      case HolidayDurationType.HALFDAY_MORNING:
        return "Mui-half-day-morning-holiday";
      case HolidayDurationType.HALFDAY_EVENING:
        return "Mui-half-day-evening-holiday";
      default:
        return "";
    }
  });

  const uniqueHolidayClasses = new Set(holidayClasses);

  if (uniqueHolidayClasses.has("Mui-full-day-holiday")) {
    return "Mui-full-day-holiday";
  }

  if (
    uniqueHolidayClasses.has("Mui-half-day-morning-holiday") &&
    uniqueHolidayClasses.has("Mui-half-day-evening-holiday")
  ) {
    return "Mui-full-day-holiday";
  }

  return Array.from(uniqueHolidayClasses).join(" ");
};

interface GetLeaveRequestClassesProps {
  leaveRequests: MyLeaveRequestPayloadType[];
  workingDays: string[] | undefined;
  date: DateTime;
  holidays: Holiday[] | null;
}

export const getLeaveRequestClasses = ({
  leaveRequests,
  workingDays,
  date,
  holidays
}: GetLeaveRequestClassesProps): string => {
  const isDateEnabled = !isNotAWorkingDate({
    date,
    workingDays: workingDays ?? []
  });

  if (isDateEnabled) {
    if (holidays?.length !== 0) {
      const leaveClasses = holidays?.map((holiday) => {
        switch (holiday?.holidayDuration) {
          case HolidayDurationType.FULLDAY:
            return "";
          case HolidayDurationType.HALFDAY_MORNING:
            return "Mui-half-day-evening-leave";
          case HolidayDurationType.HALFDAY_EVENING:
            return "Mui-half-day-morning-leave";
          default:
            return "";
        }
      });

      const uniqueLeaveClasses = new Set(leaveClasses);

      if (
        uniqueLeaveClasses.has("Mui-half-day-morning-leave") &&
        uniqueLeaveClasses.has("Mui-half-day-evening-leave")
      ) {
        return "";
      }

      return Array.from(uniqueLeaveClasses).join(" ");
    }
    
    if (leaveRequests?.length !== 0) {
      const leaveClasses = leaveRequests?.map((request) => {
        switch (request.leaveState) {
          case LeaveStates.FULL_DAY:
            return "Mui-full-day-leave";
          case LeaveStates.MORNING:
            return "Mui-half-day-morning-leave";
          case LeaveStates.EVENING:
            return "Mui-half-day-evening-leave";
          default:
            return "";
        }
      });

      const uniqueLeaveClasses = new Set(leaveClasses);

      if (
        uniqueLeaveClasses.has("Mui-half-day-morning-leave") &&
        uniqueLeaveClasses.has("Mui-half-day-evening-leave")
      ) {
        return "Mui-full-day-leave";
      }

      return Array.from(uniqueLeaveClasses).join(" ");
    }
  }

  return "";
};
