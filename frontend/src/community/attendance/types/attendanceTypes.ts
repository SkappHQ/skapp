export type AttendanceConfigurationType = {
  isClockInOnNonWorkingDays: boolean;
  isClockInOnCompanyHolidays: boolean;
  isClockInOnLeaveDays: boolean;
  isAutoApprovalForChanges: boolean;
  isGeoFencingEnabled?: boolean;
  isNotifyManagerOnLateArrival?: boolean;
};

export interface ManagerTimesheetHeaderType {
  headerDate: string;
  headerDateObject: Date;
}

export enum AttendanceSlotType {
  START = "START",
  END = "END",
  PAUSE = "PAUSE",
  RESUME = "RESUME",
  READY = "READY",
  HOLIDAY = "HOLIDAY",
  NON_WORKING_DAY = "NON_WORKING_DAY",
  LEAVE_DAY = "LEAVE_DAY"
}

export interface attendanceStatusTypes {
  slotType: AttendanceSlotType | null;
  slotStartTime: string | null;
  breakHours: number | null;
  workHours: number | null;
}

export interface attendanceLeaveStatusTypes {
  onLeave: boolean;
  duration: string | null;
  date: string | null;
  leaveName: string | null;
  leaveIcon: string | null;
}

export enum AttendancePopupTypes {
  CLOCK_IN = "CLOCK_IN",
  CLOCK_OUT = "CLOCK_OUT"
}

export enum leaveDurationTypes {
  HALF_DAY_EVENING = "HALFDAY_EVENING",
  HALF_DAY_MORNING = "HALFDAY_MORNING",
  FULL_DAY = "FULLDAY"
}

export interface attendanceLeaveAvailabilityTypes {
  leaveRequestId: number;
  leaveType: LeaveTypes;
  leaveState: leaveDurationTypes;
  startDate: string;
  endDate: string;
  status: string;
  durationHours: number | null;
  durationDays: number | null;
  creationDate: string;
  requestDesc: string;
  viewed: boolean;
}

interface LeaveTypes {
  typeId: number;
  name: string;
  emoji: string;
  color: string;
  calculationType: string | null;
  leaveDuration: string;
  leaveTypeRuleResponseDtoList: null;
  autoApprovalEnabled: boolean;
  carryForwardEnabled: boolean;
  isActive: boolean;
  attachment: boolean;
  attachmentMandatory: boolean;
  commentMandatory: boolean;
}

export interface attendanceLeaveStatusOutputTypes {
  duration: string;
  date: string;
  leaveName: string;
  leaveIcon: string;
}

export type TimeRecordResponse = {
  timeRecordId: number;
  date: Date;
  day: string;
  clockInTime: number | null;
  clockOutTime: number | null;
  workedHours: number;
  breakHours: number;
  leaveHours: number;
};
