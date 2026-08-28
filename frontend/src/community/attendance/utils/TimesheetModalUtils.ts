import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  DailyLogType,
  TimeAvailabilityType,
  TimeEntryFormValueType
} from "~community/attendance/types/timeSheetTypes";
import { isToday } from "~community/attendance/utils/TimeUtils";

export const getTimeEntryModalType = (
  record: DailyLogType
): EmployeeTimesheetModalTypes | null => {
  const hasRecord = Boolean(record?.timeRecordId);
  const hasSlots = Boolean(record?.timeSlots?.length);
  const hasLeaveOrHoliday = Boolean(record?.leaveRequest || record?.holiday);

  if (!hasRecord && hasLeaveOrHoliday && !hasSlots) {
    return EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY;
  }
  if (hasRecord && hasLeaveOrHoliday && hasSlots) {
    return EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY;
  }

  if (hasRecord && !record?.leaveRequest && hasSlots) {
    return EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY;
  }
  if (!hasRecord && !record?.leaveRequest && !hasSlots) {
    return EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE;
  }
  return null;
};

export const getSelfServiceAddConfirmation = (
  values: TimeEntryFormValueType,
  timeAvailability: TimeAvailabilityType,
  slotType?: AttendanceSlotType | null
): EmployeeTimesheetModalTypes | null => {
  const isOngoingSession =
    (slotType === AttendanceSlotType.START ||
      slotType === AttendanceSlotType.PAUSE ||
      slotType === AttendanceSlotType.RESUME) &&
    isToday(values?.timeEntryDate);

  if (isOngoingSession) {
    return EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY;
  }
  if (
    timeAvailability?.editTimeRequests ||
    timeAvailability?.manualEntryRequests?.length
  ) {
    return EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS;
  }
  if (timeAvailability?.timeSlotsExists) {
    return EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS;
  }
  if (timeAvailability?.leaveRequest?.length) {
    return EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY;
  }
  if (timeAvailability?.holiday?.length) {
    return EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY;
  }
  return null;
};
