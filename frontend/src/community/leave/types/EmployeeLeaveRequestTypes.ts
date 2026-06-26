import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

export enum EmployeeLeaveStatusPopupTypes {
  DECLINE = "DECLINE_POPUP",
  APPROVED_STATUS = "APPROVED_STATUS_POPUP",
  DECLINE_STATUS = "DECLINE_STATUS_POPUP",
  CANCEL_REQUEST_POPUP = "CANCEL_REQUEST_POPUP",
  CANCELLED_SUMMARY = "CANCELLED_SUMMARY"
}

interface LeaveType {
  typeId: number;
  name: string;
  emojiCode: string;
  colorCode: string;
}

export interface EmployeeLeaveRequestType {
  employeeId: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  authPic: string;
}

export enum LeaveState {
  HALF_DAY_EVENING = "HALFDAY_EVENING",
  FULL_DAY = "FULLDAY",
  HALF_DAY_MORNING = "HALFDAY_MORNING"
}

export interface AttachmentType {
  url: string;
}

export interface LeaveRequestDataType {
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  leaveState: "" | LeaveState;
  status: "" | LeaveStatusTypes;
  durationHours: number | null;
  isViewed: boolean | null;
  durationDays: number;
  requestDesc: string;
  createdDate?: string;
  reviewerComment?: string | null;
  reviewedDate?: string | null;
  employee?: EmployeeLeaveRequestType;
  reviewer?: EmployeeLeaveRequestType | null;
  attachments?: AttachmentType[];
}
