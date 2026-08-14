import { DateTime } from "luxon";
import { Dispatch, SetStateAction } from "react";

import {
  useAddManualTimeEntry,
  useDirectTimeEntry,
  useEditClockInOut
} from "~community/attendance/api/AttendanceEmployeeApi";
import { TIME_FORMAT_AM_PM } from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  TimeAvailabilityType,
  TimeEntryFormValueType
} from "~community/attendance/types/timeSheetTypes";
import {
  convertTo12HourByDateString,
  convertToDateTime,
  convertToUtc,
  getCurrentTimeZone,
  getDuration,
  isToday
} from "~community/attendance/utils/TimeUtils";
import { TOAST_AUTO_HIDE_DURATION } from "~community/common/constants/commonConstants";
import { HTTP_CONFLICT } from "~community/common/constants/httpStatusCodes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { formatDateWithOrdinalIndicator } from "~community/common/utils/dateTimeUtils";

const useAddEntry = () => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setToastMessage } = useToast();
  const {
    attendanceParams,
    selectedDailyRecord,
    employeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen,
    setEmployeeTimesheetModalType,
    setTimeAvailabilityForPeriod,
    setCurrentAddTimeChanges,
    directEntryEmployee
  } = useAttendanceStore((state) => state);
  const status = attendanceParams.slotType;

  const isDirectEntry = Boolean(directEntryEmployee);

  const onSuccessManual = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntrySuccessTitle"]),
      description: translateText(["addTimeEntrySuccessDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onSuccessEdit = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntrySuccessTitle"]),
      description: translateText(["editTimeEntrySuccessDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onError = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntryErrorTitle"]),
      description: translateText(["addTimeEntryErrorDes"]),
      toastType: ToastType.ERROR
    });
  };
  // Enhanced onError to handle "No manager Found" 400 error
  const enhancedOnError = (error: ErrorResponse) => {
    if (error?.response?.data?.results?.[0]?.message === "No managers found") {
      setToastMessage({
        open: true,
        title: translateText(["addTimeEntryNoManagerErrorTitle"]),
        description: translateText(["managerMissingErrorDes"]),
        toastType: ToastType.ERROR
      });
    } else {
      setToastMessage({
        open: true,
        title: translateText(["addTimeEntryErrorTitle"]),
        description: translateText(["addTimeEntryErrorDes"]),
        toastType: ToastType.ERROR
      });
    }
  };

  const onSuccessDirectEntry = (isEdit: boolean) => {
    setToastMessage({
      open: true,
      title: translateText([
        isEdit ? "directEntryUpdatedToastTitle" : "directEntryAddedToastTitle"
      ]),
      description: translateText(
        [isEdit ? "directEntryUpdatedToastDes" : "directEntryAddedToastDes"],
        {
          employeeName: directEntryEmployee?.employeeName ?? "",
          date: selectedDailyRecord?.date
            ? formatDateWithOrdinalIndicator(new Date(selectedDailyRecord.date))
            : ""
        }
      ),
      toastType: ToastType.SUCCESS,
      autoHideDuration: TOAST_AUTO_HIDE_DURATION
    });
  };

  const onDirectEntryError = (error: ErrorResponse) => {
    const isConflict = error?.response?.status === HTTP_CONFLICT;
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntryErrorTitle"]),
      description: translateText([
        isConflict ? "directEntryConflictErrorDes" : "directEntrySaveErrorDes"
      ]),
      toastType: ToastType.ERROR,
      autoHideDuration: null
    });
  };

  const { mutate: directEntryMutate } = useDirectTimeEntry(
    () => onSuccessDirectEntry(Boolean(selectedDailyRecord?.timeRecordId)),
    onDirectEntryError
  );

  const { mutate: manualEntryMutate } = useAddManualTimeEntry(
    onSuccessManual,
    enhancedOnError
  );

  const { mutate: editClockInOutMutate } = useEditClockInOut(
    onSuccessEdit,
    onError
  );

  const isDurationValid = (fromTime: string, toTime: string): boolean => {
    const duration = getDuration(fromTime, toTime);
    if (duration?.includes("-")) {
      setToastMessage({
        open: true,
        title: translateText(["invalidTimeTitle"]),
        description: translateText(["invalidTimeDes"]),
        toastType: ToastType.ERROR
      });
      return false;
    } else {
      return true;
    }
  };

  /**
   * Routes a self-service add through whichever confirmation has to come first: an
   * ongoing session, a conflicting request, an existing entry, or a leave or holiday on
   * that date. Falling past all of them submits the request for approval.
   */
  const routeSelfServiceAddEntry = (
    values: TimeEntryFormValueType,
    timeAvailability: TimeAvailabilityType,
    dateTimeFromTime: string | null,
    dateTimeToTime: string | null,
    setFromDateTime: Dispatch<SetStateAction<string>>,
    setToDateTime: Dispatch<SetStateAction<string>>
  ) => {
    const isOngoingSession =
      (status === AttendanceSlotType.START ||
        status === AttendanceSlotType.PAUSE ||
        status === AttendanceSlotType.RESUME) &&
      isToday(values?.timeEntryDate);

    const stageDateTimes = () => {
      setFromDateTime(dateTimeFromTime ?? "");
      setToDateTime(dateTimeToTime ?? "");
    };

    const openModal = (modalType: EmployeeTimesheetModalTypes) => {
      setIsEmployeeTimesheetModalOpen(true);
      setEmployeeTimesheetModalType(modalType);
    };

    if (isOngoingSession) {
      openModal(EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY);
    } else if (
      timeAvailability?.editTimeRequests ||
      timeAvailability?.manualEntryRequests?.length
    ) {
      openModal(EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS);
    } else if (timeAvailability?.timeSlotsExists) {
      stageDateTimes();
      openModal(EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS);
    } else if (timeAvailability?.leaveRequest?.length) {
      setTimeAvailabilityForPeriod(timeAvailability);
      stageDateTimes();
      openModal(EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY);
    } else if (timeAvailability?.holiday?.length) {
      setTimeAvailabilityForPeriod(timeAvailability);
      stageDateTimes();
      openModal(EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY);
    } else {
      manualEntryMutate({
        startTime: convertToUtc(dateTimeFromTime),
        endTime: convertToUtc(dateTimeToTime),
        zoneId: getCurrentTimeZone()
      });
      setIsEmployeeTimesheetModalOpen(false);
    }

    setCurrentAddTimeChanges(values);
  };

  const handleTimeEntrySubmit = (
    values: TimeEntryFormValueType,
    timeAvailability: TimeAvailabilityType,
    setFromDateTime: Dispatch<SetStateAction<string>>,
    setToDateTime: Dispatch<SetStateAction<string>>
  ) => {
    const dateTimeFromTime = convertToDateTime(
      values.timeEntryDate,
      values.fromTime
    );
    const dateTimeToTime = convertToDateTime(
      values.timeEntryDate,
      values.toTime
    );

    if (!isDurationValid(values.fromTime, values.toTime)) return;

    if (isDirectEntry && directEntryEmployee) {
      const existingRecordId = selectedDailyRecord?.timeRecordId ?? undefined;
      directEntryMutate({
        employeeId: directEntryEmployee.employeeId,
        isEdit: Boolean(existingRecordId),
        payload: {
          startTime: convertToUtc(dateTimeFromTime),
          endTime: convertToUtc(dateTimeToTime),
          recordId: existingRecordId,
          zoneId: getCurrentTimeZone()
        }
      });
      setIsEmployeeTimesheetModalOpen(false);
      return;
    }

    if (
      employeeTimesheetModalType === EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
    ) {
      routeSelfServiceAddEntry(
        values,
        timeAvailability,
        dateTimeFromTime,
        dateTimeToTime,
        setFromDateTime,
        setToDateTime
      );
      return;
    }

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE
    ) {
      manualEntryMutate({
        startTime: convertToUtc(dateTimeFromTime),
        endTime: convertToUtc(dateTimeToTime),
        zoneId: getCurrentTimeZone()
      });
      setIsEmployeeTimesheetModalOpen(false);
      return;
    }

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      editClockInOutMutate({
        startTime: convertToUtc(dateTimeFromTime),
        endTime: convertToUtc(dateTimeToTime),
        recordId: selectedDailyRecord?.timeRecordId ?? undefined,
        zoneId: getCurrentTimeZone()
      });
      setIsEmployeeTimesheetModalOpen(false);
    }
  };

  const isSubmitDisabled = (
    values: TimeEntryFormValueType,
    isGetTimeAvailabilityLoading: boolean
  ) => {
    const currentRecordStartTime = convertTo12HourByDateString(
      selectedDailyRecord?.timeSlots?.[0]?.startTime ?? ""
    );
    const currentRecordEndTime = convertTo12HourByDateString(
      selectedDailyRecord?.timeSlots?.[
        (selectedDailyRecord?.timeSlots?.length ?? 0) - 1
      ]?.endTime ?? ""
    );

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.ADD_TIME_ENTRY &&
      isGetTimeAvailabilityLoading
    ) {
      return true;
    } else if (
      (employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
        employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY) &&
      currentRecordStartTime === values?.fromTime &&
      currentRecordEndTime === values?.toTime
    ) {
      return true;
    } else {
      return false;
    }
  };

  const clockInOutWithPrevTimeValidation = (
    fromTime: string,
    toTime: string,
    prevFromTime: string,
    prevToTime: string,
    isWithToast: boolean
  ) => {
    const prevStartTimeWithDate = DateTime.fromISO(prevFromTime);
    const prevEndTimeWithDate = prevToTime
      ? DateTime.fromISO(prevToTime)
      : null;
    const startTimeWithDate = DateTime.fromFormat(
      fromTime,
      TIME_FORMAT_AM_PM
    ).set({
      day: prevStartTimeWithDate.day,
      month: prevStartTimeWithDate.month,
      year: prevStartTimeWithDate.year
    });

    if (clockInOutValidation(fromTime, toTime, isWithToast)) {
      return true;
    }

    if (prevEndTimeWithDate === null) {
      return false;
    }

    const endTimeWithDate = DateTime.fromFormat(toTime, TIME_FORMAT_AM_PM).set({
      day: prevEndTimeWithDate.day,
      month: prevEndTimeWithDate.month,
      year: prevEndTimeWithDate.year
    });

    if (startTimeWithDate >= prevEndTimeWithDate) {
      if (isWithToast) {
        setToastMessage({
          open: true,
          title: translateText(["invalidClockInTitle"]),
          description: translateText(["invalidClockInDes"]),
          toastType: ToastType.ERROR
        });
      }
      return true;
    }
    if (endTimeWithDate <= prevStartTimeWithDate) {
      if (isWithToast) {
        setToastMessage({
          open: true,
          title: translateText(["invalidClockOutTitle"]),
          description: translateText(["invalidClockOutDes"]),
          toastType: ToastType.ERROR
        });
      }
      return true;
    }
    return false;
  };

  const clockInOutValidation = (
    fromTime: string,
    toTime: string,
    isWithToast: boolean
  ) => {
    if (!!fromTime && !!toTime && fromTime === toTime) {
      if (isWithToast) {
        setToastMessage({
          open: true,
          title: translateText(["invalidEntryTitle"]),
          description: translateText(["invalidEntryDes"]),
          toastType: ToastType.ERROR
        });
      }
      return true;
    } else {
      return false;
    }
  };

  return {
    isDurationValid,
    handleTimeEntrySubmit,
    isSubmitDisabled,
    clockInOutWithPrevTimeValidation,
    clockInOutValidation
  };
};

export default useAddEntry;
