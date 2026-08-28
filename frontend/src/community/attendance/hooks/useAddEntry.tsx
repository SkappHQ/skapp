import { DateTime } from "luxon";
import { Dispatch, SetStateAction, useRef } from "react";

import {
  useAddManualTimeEntry,
  useEditClockInOut
} from "~community/attendance/api/AttendanceEmployeeApi";
import { TIME_FORMAT_AM_PM } from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  DirectManualTimeEntryVariablesType,
  TimeAvailabilityType,
  TimeEntryFormValueType
} from "~community/attendance/types/timeSheetTypes";
import {
  convertTo12HourByDateString,
  convertToDateTime,
  convertToUtc,
  getCurrentTimeZone,
  getDuration
} from "~community/attendance/utils/TimeUtils";
import { getModalBeforeManualEntry } from "~community/attendance/utils/TimesheetModalUtils";
import {
  EP_TIME_ERROR_DIRECT_ENTRY_REQUEST_ALREADY_RESOLVED,
  PEOPLE_ERROR_NO_MANAGERS_FOUND,
  TIME_ERROR_MANUAL_ENTRY_RESTRICTED
} from "~community/common/constants/errorMessageKeys";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import {
  convertYYYYMMDDToDateTime,
  formatDateTimeWithOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";
import {
  useAddDirectTimeEntry,
  useEditDirectTimeEntry
} from "~enterprise/attendance/api/AttendanceApi";

const MODALS_RETAINING_AVAILABILITY = new Set<EmployeeTimesheetModalTypes>([
  EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY,
  EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY
]);

const MODALS_CARRYING_ENTERED_TIMES = new Set<EmployeeTimesheetModalTypes>([
  EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS,
  EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY,
  EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY
]);

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
    directManualTimeEntryEligibleEmployee
  } = useAttendanceStore((state) => state);
  const status = attendanceParams.slotType;

  const lastDirectManualTimeEntryRequest =
    useRef<DirectManualTimeEntryVariablesType | null>(null);

  const showErrorToast = (titleKey: string, descriptionKey: string) => {
    setToastMessage({
      open: true,
      title: translateText([titleKey]),
      description: translateText([descriptionKey]),
      toastType: ToastType.ERROR
    });
  };

  const onSuccessAddManualTimeEntry = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntrySuccessTitle"]),
      description: translateText(["addTimeEntrySuccessDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onSuccessEditManualTimeEntry = () => {
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
  const enhancedOnError = (error: ErrorResponse) => {
    const messageKey = error?.response?.data?.results?.[0]?.messageKey;

    if (messageKey === TIME_ERROR_MANUAL_ENTRY_RESTRICTED) {
      showErrorToast("addTimeEntryErrorTitle", "manualEntryRestrictedErrorDes");
      return;
    }

    if (messageKey === PEOPLE_ERROR_NO_MANAGERS_FOUND) {
      showErrorToast(
        "addTimeEntryNoManagerErrorTitle",
        "managerMissingErrorDes"
      );
      return;
    }

    showErrorToast("addTimeEntryErrorTitle", "addTimeEntryErrorDes");
  };

  const getDirectManualTimeEntryDetails = () => {
    const request = lastDirectManualTimeEntryRequest.current;

    return {
      employeeName: request?.employeeName ?? "",
      date: request?.entryDate
        ? formatDateTimeWithOrdinalIndicator(
            convertYYYYMMDDToDateTime(request.entryDate)
          )
        : ""
    };
  };

  const onDirectManualTimeEntryAddSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["directEntryAddedToastTitle"]),
      description: translateText(
        ["directEntryAddedToastDes"],
        getDirectManualTimeEntryDetails()
      ),
      toastType: ToastType.SUCCESS
    });
  };

  const onDirectManualTimeEntryEditSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["directEntryUpdatedToastTitle"]),
      description: translateText(
        ["directEntryUpdatedToastDes"],
        getDirectManualTimeEntryDetails()
      ),
      toastType: ToastType.SUCCESS
    });
  };

  const onDirectManualTimeEntryError = (error: ErrorResponse) => {
    const isConflict =
      error?.response?.data?.results?.[0]?.messageKey ===
      EP_TIME_ERROR_DIRECT_ENTRY_REQUEST_ALREADY_RESOLVED;

    showErrorToast(
      "addTimeEntryErrorTitle",
      isConflict ? "directEntryConflictErrorDes" : "directEntrySaveErrorDes"
    );
  };

  const { mutate: addDirectManualTimeEntryMutate } = useAddDirectTimeEntry(
    onDirectManualTimeEntryAddSuccess,
    onDirectManualTimeEntryError
  );

  const { mutate: editDirectManualTimeEntryMutate } = useEditDirectTimeEntry(
    onDirectManualTimeEntryEditSuccess,
    onDirectManualTimeEntryError
  );

  const { mutate: manualEntryMutate } = useAddManualTimeEntry(
    onSuccessAddManualTimeEntry,
    enhancedOnError
  );

  const { mutate: editClockInOutMutate } = useEditClockInOut(
    onSuccessEditManualTimeEntry,
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

  const submitManualTimeEntry = (
    values: TimeEntryFormValueType,
    timeAvailability: TimeAvailabilityType,
    dateTimeFromTime: string | null,
    dateTimeToTime: string | null,
    setFromDateTime: Dispatch<SetStateAction<string>>,
    setToDateTime: Dispatch<SetStateAction<string>>
  ) => {
    const modalBeforeEntry = getModalBeforeManualEntry(
      values,
      timeAvailability,
      status
    );

    if (modalBeforeEntry === null) {
      manualEntryMutate({
        startTime: convertToUtc(dateTimeFromTime),
        endTime: convertToUtc(dateTimeToTime),
        zoneId: getCurrentTimeZone()
      });
      setIsEmployeeTimesheetModalOpen(false);
      setCurrentAddTimeChanges(values);
      return;
    }

    if (MODALS_RETAINING_AVAILABILITY.has(modalBeforeEntry)) {
      setTimeAvailabilityForPeriod(timeAvailability);
    }

    if (MODALS_CARRYING_ENTERED_TIMES.has(modalBeforeEntry)) {
      setFromDateTime(dateTimeFromTime ?? "");
      setToDateTime(dateTimeToTime ?? "");
    }

    setIsEmployeeTimesheetModalOpen(true);
    setEmployeeTimesheetModalType(modalBeforeEntry);
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

    if (directManualTimeEntryEligibleEmployee) {
      const existingRecordId = selectedDailyRecord?.timeRecordId || undefined;
      const directManualTimeEntryRequest: DirectManualTimeEntryVariablesType = {
        employeeId: directManualTimeEntryEligibleEmployee.employeeId,
        employeeName: directManualTimeEntryEligibleEmployee.employeeName,
        entryDate: selectedDailyRecord?.date ?? "",
        payload: {
          startTime: convertToUtc(dateTimeFromTime),
          endTime: convertToUtc(dateTimeToTime),
          recordId: existingRecordId,
          zoneId: getCurrentTimeZone()
        }
      };

      lastDirectManualTimeEntryRequest.current = directManualTimeEntryRequest;

      if (existingRecordId) {
        editDirectManualTimeEntryMutate(directManualTimeEntryRequest);
      } else {
        addDirectManualTimeEntryMutate(directManualTimeEntryRequest);
      }
      setIsEmployeeTimesheetModalOpen(false);
      return;
    }

    if (
      employeeTimesheetModalType === EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
    ) {
      submitManualTimeEntry(
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
        recordId: selectedDailyRecord?.timeRecordId || undefined,
        zoneId: getCurrentTimeZone()
      });
      setIsEmployeeTimesheetModalOpen(false);
    }
  };

  const isSubmitDisabled = (
    values: TimeEntryFormValueType,
    isGetTimeAvailabilityLoading: boolean
  ) => {
    const timeSlots = selectedDailyRecord?.timeSlots ?? [];

    const currentRecordStartTime = convertTo12HourByDateString(
      timeSlots[0]?.startTime ?? ""
    );
    const currentRecordEndTime = convertTo12HourByDateString(
      timeSlots.at(-1)?.endTime ?? ""
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
