import { DateTime } from "luxon";
import { SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { ToastProps } from "~community/common/types/ToastTypes";
import {
  convertToYYYYMMDDFromDateTime,
  convertYYYYMMDDToDateTime
} from "~community/common/utils/dateTimeUtils";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { MyRequestsToastMsgKeyEnums } from "~community/leave/enums/ToastMsgKeyEnums";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import { Holiday } from "~community/people/types/HolidayTypes";

interface IsNotAWorkingDateProps {
  date: DateTime;
  workingDays: string[];
}

export const isNotAWorkingDate = ({
  date,
  workingDays
}: IsNotAWorkingDateProps) => {
  if (workingDays !== undefined) {
    return !workingDays.includes(date.toFormat("cccc").toUpperCase());
  }
  return false;
};

interface GetMyLeaveRequestForDayProps {
  myLeaveRequests: MyLeaveRequestPayloadType[] | undefined;
  date: DateTime;
}

export const getMyLeaveRequestForDay = ({
  myLeaveRequests,
  date
}: GetMyLeaveRequestForDayProps) => {
  if (myLeaveRequests !== undefined) {
    const myLeaveRequestForDay = myLeaveRequests?.filter((leaveRequest) => {
      const startDate = DateTime.fromISO(leaveRequest.startDate);
      const endDate = DateTime.fromISO(leaveRequest.endDate);

      if (date >= startDate && date <= endDate) {
        return leaveRequest;
      }

      return null;
    });

    return myLeaveRequestForDay ?? null;
  }

  return null;
};

interface HandleDateChangeProps {
  date: DateTime | null;
  isRangePicker: boolean;
  selectedDates: DateTime[];
  setSelectedDates: (dates: DateTime[]) => void;
}

export const handleDateChange = ({
  date,
  isRangePicker,
  selectedDates,
  setSelectedDates
}: HandleDateChangeProps) => {
  if (!date) return;

  if (isRangePicker) {
    switch (selectedDates.length) {
      case 0:
        setSelectedDates([date]);
        break;
      case 1:
        if (date !== selectedDates[0]) {
          if (date > selectedDates[0]) {
            setSelectedDates([selectedDates[0], date]);
          } else {
            setSelectedDates([date, selectedDates[0]]);
          }
        }
        break;
      case 2:
        setSelectedDates([date]);
        break;
      default:
        setSelectedDates([date]);
        break;
    }
  } else {
    setSelectedDates([date]);
  }
};

interface HasAtLeastOneNonHolidayDateProps {
  selectedDates: DateTime[];
  allHolidays: Holiday[] | undefined;
}

export const hasAtLeastOneNonHolidayDate = ({
  selectedDates,
  allHolidays
}: HasAtLeastOneNonHolidayDateProps): boolean => {
  if (!selectedDates || selectedDates.length === 0) return false;
  if (!allHolidays || allHolidays.length === 0) return true;

  const datesToCheck: DateTime[] = [];

  if (selectedDates.length === 1) {
    datesToCheck.push(selectedDates[0]);
  } else if (selectedDates.length === 2) {
    const startDate = selectedDates[0];
    const endDate = selectedDates[1];

    let currentDate = startDate;
    while (currentDate <= endDate) {
      datesToCheck.push(currentDate);
      currentDate = currentDate.plus({ days: 1 });
    }
  }

  return datesToCheck.some((date) => {
    const holidaysForDay = getHolidaysForDay({
      allHolidays,
      date
    });

    return !holidaysForDay || holidaysForDay.length === 0;
  });
};

interface HandleDateValidationProps {
  allowedDuration: LeaveDurationTypes;
  selectedDates: DateTime[];
  allHolidays: Holiday[] | undefined;
  myLeaveRequests: MyLeaveRequestPayloadType[] | undefined;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: (key: string[], data?: Record<string, unknown>) => string;
  setIsApplyLeaveModalBtnDisabled: (value: boolean) => void;
}

export const handleDateValidation = ({
  allowedDuration,
  selectedDates,
  allHolidays,
  myLeaveRequests,
  setToastMessage,
  translateText,
  setIsApplyLeaveModalBtnDisabled
}: HandleDateValidationProps) => {
  if (!selectedDates) return;

  let isApplyLeaveModalBtnDisabled = false;

  if (allowedDuration === LeaveDurationTypes.HALF_DAY) {
    if (selectedDates.length > 1) {
      isApplyLeaveModalBtnDisabled = true;

      setToastMessage({
        key: MyRequestsToastMsgKeyEnums.ONLY_HALF_DAY_LEAVE_ALLOWED,
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["onlyHalfDayLeaveAllowedError", "title"]),
        description: translateText([
          "onlyHalfDayLeaveAllowedError",
          "description"
        ])
      });
    }
  }

  if (allHolidays !== undefined) {
    const holidays = getHolidaysWithinDateRange({
      selectedDates,
      allHolidays
    });

    if (holidays.length > 0) {
      const hasNonHolidayDate = hasAtLeastOneNonHolidayDate({
        selectedDates,
        allHolidays
      });

      isApplyLeaveModalBtnDisabled = !hasNonHolidayDate;

      const hasMultipleHolidays = holidays.length > 1;

      const toastType = ToastType.WARN;

      const titleKey = hasMultipleHolidays
        ? "multipleHolidaysExistsError"
        : "holidayExistsError";

      const title =
        translateText([titleKey, "title"], {
          holidayName: holidays[0]?.name,
          holidayCount: holidays.length - 1
        }) ?? "";

      const description = translateText([titleKey, "description"]) ?? "";

      const key = hasMultipleHolidays
        ? MyRequestsToastMsgKeyEnums.MULTIPLE_HOLIDAYS_EXIST
        : MyRequestsToastMsgKeyEnums.HOLIDAY_EXISTS;

      setToastMessage({
        key,
        open: true,
        toastType,
        title,
        description
      });
    }
  }

  if (myLeaveRequests !== undefined) {
    const leaveRequests = getLeaveRequestsWithinDateRange({
      selectedDates,
      myLeaveRequests
    });

    const leaveRequestCount = leaveRequests?.length ?? 0;

    if (leaveRequestCount > 0) {
      if (selectedDates.length === 1 || selectedDates[0] === selectedDates[1]) {
        const leaveStates = leaveRequests.map(
          (leaveRequest) => leaveRequest.leaveState
        );

        const hasFullDayLeave = leaveStates.includes(LeaveStates.FULL_DAY);
        const hasHalfDayMorningAndEvening =
          leaveStates.includes(LeaveStates.MORNING) &&
          leaveStates.includes(LeaveStates.EVENING);

        isApplyLeaveModalBtnDisabled =
          hasFullDayLeave || hasHalfDayMorningAndEvening;
      } else {
        isApplyLeaveModalBtnDisabled = true;
      }

      const hasMultipleLeaves = leaveRequestCount > 1;

      const toastType = ToastType.WARN;

      const titleKey = hasMultipleLeaves
        ? "multipleLeavesAlreadyAppliedError"
        : "leaveAlreadyAppliedError";

      const title = translateText([titleKey, "title"]);
      const description = translateText([titleKey, "description"]);

      const key = hasMultipleLeaves
        ? MyRequestsToastMsgKeyEnums.MULTIPLE_LEAVES_ALREADY_APPLIED
        : MyRequestsToastMsgKeyEnums.LEAVE_ALREADY_APPLIED;

      setToastMessage({
        key,
        open: true,
        toastType,
        title,
        description
      });
    }

    setIsApplyLeaveModalBtnDisabled(isApplyLeaveModalBtnDisabled);
  }
};

interface GetHolidaysForDayProps {
  allHolidays: Holiday[] | undefined;
  date: DateTime;
}

export const getHolidaysForDay = ({
  allHolidays,
  date
}: GetHolidaysForDayProps): Holiday[] | null => {
  if (allHolidays) {
    const holidaysForDay = allHolidays.filter((holiday) => {
      return holiday.date === convertToYYYYMMDDFromDateTime(date);
    });

    return holidaysForDay ?? null;
  }

  return null;
};

interface GetHolidaysWithinDateRangeProps {
  selectedDates: DateTime[];
  allHolidays: Holiday[] | undefined;
}

export const getHolidaysWithinDateRange = ({
  selectedDates,
  allHolidays
}: GetHolidaysWithinDateRangeProps) => {
  if (!allHolidays) return [];

  const startDate = selectedDates[0];
  const endDate = selectedDates[1] ?? selectedDates[0];

  const holidaysWithinRange = allHolidays.filter((holiday) => {
    const holidayDate = convertYYYYMMDDToDateTime(holiday.date);

    return startDate <= holidayDate && holidayDate <= endDate;
  });

  return holidaysWithinRange;
};

interface GetLeaveRequestsWithinDateRangeProps {
  selectedDates: DateTime[];
  myLeaveRequests: MyLeaveRequestPayloadType[] | undefined;
}

export const getLeaveRequestsWithinDateRange = ({
  selectedDates,
  myLeaveRequests
}: GetLeaveRequestsWithinDateRangeProps): MyLeaveRequestPayloadType[] => {
  if (!myLeaveRequests) return [];

  const startDate = selectedDates[0];
  const endDate = selectedDates[1] ?? selectedDates[0];

  const leaveRequestsWithinRange = myLeaveRequests.filter(
    (leaveRequest: MyLeaveRequestPayloadType) => {
      const leaveStartDate = DateTime.fromISO(leaveRequest.startDate);
      const leaveEndDate = DateTime.fromISO(leaveRequest.endDate);

      return (
        (startDate >= leaveStartDate && startDate <= leaveEndDate) ||
        (endDate >= leaveStartDate && endDate <= leaveEndDate) ||
        (startDate <= leaveStartDate && endDate >= leaveEndDate)
      );
    }
  );

  return leaveRequestsWithinRange;
};
