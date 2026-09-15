import { DateTime } from "luxon";
import { Dispatch, SetStateAction } from "react";

import {
  useAddManualTimeEntry,
  useEditClockInOut
} from "~community/attendance/api/AttendanceEmployeeApi";
import { TIME_FORMAT_AM_PM } from "~community/attendance/constants/constants";
import {
  EmployeeTimesheetModalTypes,
  TimeSheetRequestStates
} from "~community/attendance/enums/timesheetEnums";
import useManualEntryRestriction from "~community/attendance/hooks/useManualEntryRestriction";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  DirectManualTimeEntryVariablesType,
  TimeAvailabilityType,
  TimeEntryFormValueType,
  TimeRequestDataType
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
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import { normalizeEmployeeId } from "~community/people/utils/birthdayNotificationUtils";
import {
  useAddDirectTimeEntry,
  useEditDirectTimeEntry
} from "~enterprise/attendance/api/AttendanceApi";

const EMPLOYEE_TIME_ENTRY_MODALS_RETAINING_AVAILABILITY =
  new Set<EmployeeTimesheetModalTypes>([
    EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY,
    EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY
  ]);

const EMPLOYEE_TIME_ENTRY_MODALS_CARRYING_ENTERED_TIMES =
  new Set<EmployeeTimesheetModalTypes>([
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

  const { canDirectlyAddOrEditEntry } = useManualEntryRestriction();
  const { data: currentEmployee } = useGetUserPersonalDetails();

  const ownEmployeeId = normalizeEmployeeId(currentEmployee?.employeeId);

  const directTimeEntryEmployeeId =
    directManualTimeEntryEligibleEmployee?.employeeId ??
    (canDirectlyAddOrEditEntry ? ownEmployeeId : undefined);

  const isDirectTimeEntry = directTimeEntryEmployeeId !== undefined;

  const isOwnDirectEntryUnresolved =
    canDirectlyAddOrEditEntry &&
    !directManualTimeEntryEligibleEmployee &&
    ownEmployeeId === undefined;

  const showErrorToast = (titleKey: string, descriptionKey: string) => {
    setToastMessage({
      open: true,
      title: translateText([titleKey]),
      description: translateText([descriptionKey]),
      toastType: ToastType.ERROR
    });
  };

  const isApprovedOnSubmission = (timeRequest?: TimeRequestDataType): boolean =>
    timeRequest?.status === TimeSheetRequestStates.APPROVED;

  const onSuccessAddManualTimeEntry = (timeRequest?: TimeRequestDataType) => {
    const isApproved = isApprovedOnSubmission(timeRequest);

    setToastMessage({
      open: true,
      title: translateText([
        isApproved ? "directEntryAddedToastTitle" : "addTimeEntrySuccessTitle"
      ]),
      description: translateText([
        isApproved ? "directEntryAddedToastDes" : "addTimeEntrySuccessDes"
      ]),
      toastType: ToastType.SUCCESS
    });
  };

  const onSuccessEditManualTimeEntry = (timeRequest?: TimeRequestDataType) => {
    const isApproved = isApprovedOnSubmission(timeRequest);

    setToastMessage({
      open: true,
      title: translateText([
        isApproved ? "directEntryUpdatedToastTitle" : "addTimeEntrySuccessTitle"
      ]),
      description: translateText([
        isApproved ? "directEntryUpdatedToastDes" : "editTimeEntrySuccessDes"
      ]),
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

  const onDirectManualTimeEntryAddSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["directEntryAddedToastTitle"]),
      description: translateText(["directEntryAddedToastDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onDirectManualTimeEntryEditSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["directEntryUpdatedToastTitle"]),
      description: translateText(["directEntryUpdatedToastDes"]),
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

  const addTimeEntry = (startTime: string, endTime: string): void => {
    const zoneId = getCurrentTimeZone();

    if (directTimeEntryEmployeeId !== undefined) {
      const directTimeEntryRequest: DirectManualTimeEntryVariablesType = {
        employeeId: directTimeEntryEmployeeId,
        payload: { startTime, endTime, zoneId }
      };
      addDirectManualTimeEntryMutate(directTimeEntryRequest);
      return;
    }

    manualEntryMutate({ startTime, endTime, zoneId });
  };

  const editTimeEntry = (
    startTime: string,
    endTime: string,
    recordId?: number
  ): void => {
    const zoneId = getCurrentTimeZone();

    if (directTimeEntryEmployeeId !== undefined) {
      const directTimeEntryRequest: DirectManualTimeEntryVariablesType = {
        employeeId: directTimeEntryEmployeeId,
        payload: { startTime, endTime, recordId, zoneId }
      };
      editDirectManualTimeEntryMutate(directTimeEntryRequest);
      return;
    }

    editClockInOutMutate({ startTime, endTime, recordId, zoneId });
  };

  const confirmManualTimeEntry = (
    fromDateTime: string,
    toDateTime: string
  ): void => {
    addTimeEntry(convertToUtc(fromDateTime), convertToUtc(toDateTime));
    setIsEmployeeTimesheetModalOpen(false);
  };

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
    const employeeConfirmationModalType = getModalBeforeManualEntry(
      values,
      timeAvailability,
      status,
      isDirectTimeEntry
    );

    if (employeeConfirmationModalType === null) {
      addTimeEntry(
        convertToUtc(dateTimeFromTime),
        convertToUtc(dateTimeToTime)
      );
      setIsEmployeeTimesheetModalOpen(false);
      setCurrentAddTimeChanges(values);
      return;
    }

    if (
      EMPLOYEE_TIME_ENTRY_MODALS_RETAINING_AVAILABILITY.has(
        employeeConfirmationModalType
      )
    ) {
      setTimeAvailabilityForPeriod(timeAvailability);
    }

    if (
      EMPLOYEE_TIME_ENTRY_MODALS_CARRYING_ENTERED_TIMES.has(
        employeeConfirmationModalType
      )
    ) {
      setFromDateTime(dateTimeFromTime ?? "");
      setToDateTime(dateTimeToTime ?? "");
    }

    setIsEmployeeTimesheetModalOpen(true);
    setEmployeeTimesheetModalType(employeeConfirmationModalType);
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
      addTimeEntry(
        convertToUtc(dateTimeFromTime),
        convertToUtc(dateTimeToTime)
      );
      setIsEmployeeTimesheetModalOpen(false);
      return;
    }

    if (
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
      employeeTimesheetModalType ===
        EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY
    ) {
      editTimeEntry(
        convertToUtc(dateTimeFromTime),
        convertToUtc(dateTimeToTime),
        selectedDailyRecord?.timeRecordId || undefined
      );
      setIsEmployeeTimesheetModalOpen(false);
    }
  };

  const isSubmitDisabled = (
    values: TimeEntryFormValueType,
    isGetTimeAvailabilityLoading: boolean
  ) => {
    if (isOwnDirectEntryUnresolved) {
      return true;
    }

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
    isDirectTimeEntry,
    isDurationValid,
    handleTimeEntrySubmit,
    confirmManualTimeEntry,
    isSubmitDisabled,
    clockInOutWithPrevTimeValidation,
    clockInOutValidation
  };
};

export default useAddEntry;
