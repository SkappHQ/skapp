import { Manager } from "~community/people/types/EmployeeTypes";

import { LeaveTypeType } from "./AddLeaveTypes";
import { LeaveTypes } from "./CustomLeaveAllocationTypes";

export enum LeaveStatusTypes {
  APPROVED = "Approved",
  CANCELLED = "Cancelled",
  DENIED = "Denied",
  PENDING = "Pending",
  REVOKED = "Revoked",
  SUPERVISOR_NUDGED = "Supervisor_Nudged"
}

export enum LeaveExtraPopupTypes {
  DECLINE = "Decline popup",
  APPROVED_STATUS = "Approved status popup",
  DECLINE_STATUS = "Decline status popup",
  CANCEL_REQUEST_POPUP = "CancelRequestPopup",
  CANCELLD_SUMMERY = "CancelledSummery",
  CANCELATION_UNDO_POPUP = "CancelationUndoPopup",
  REVOKE_POPUP = "RevokePopup",
  REVOKE_SUMMARY_POPUP = "REVOKESUMMARYPOPUP",
  REVOKE_UNDO_POPUP = "RevokeUndoPopup",
  ON_LEAVE_MODAL = "OnLeaveModal"
}

export interface LeaveRequestItemsType {
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: LeaveTypeType;
  durationDays?: string;
  reasonForLeave: string | null;
  leaveState: string;
  status: LeaveStatusTypes;
  requestDesc: string | null;
  reviewerComment: string | null;
  employee: Manager;
  creationDate: string | number | null;
  leaveRequestDates: string;
  attachments: [];
  managerType: string;
}

export interface SingleLeaveRequestItemType extends LeaveRequestItemsType {
  creationDate: string;
  reviewedDate: string;
  reviewer: Manager;
}

export interface LeaveRequestsFilterType {
  status: string[];
  type: string[];
  date: string;
}

export type LeaveRequestsFilters = "status" | "type" | "date";

export interface LeaveRequestResultsType {
  items: LeaveRequestItemsType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface leaveRequestRowDataTypes {
  leaveId?: number | null;
  empId?: number | null;
  empName?: string;
  lastName?: string;
  avatarUrl?: string;
  dates?: string;
  days?: string | number;
  durationDays?: string;
  reason?: string;
  reviewerComment?: string;
  status?: "" | LeaveStatusTypes;
  leaveType?: string | LeaveTypes;
  leaveEmoji?: string;
  startDate?: string;
  endDate?: string;
  creationDate?: string;
  reviewedDate?: string;
  reviewer: Manager;
  attachments: LeaveAttachmentType[];
  managerType: string;
}

export interface LeaveAttachmentType {
  url: string;
}

export enum ApplyLeaveErrorTypes {
  LEAVE_OVERLAP = "Found leave request overlap",
  ENTITLEMENT_NOT_SUFFICIENT = "Leave Entitlement is not sufficient to proceed",
  INVALID_LEAVE_REQUEST_STATUS_EMPLOYEE = "Invalid leave request status update by Employee",
  INVLID_NUDGE_MANAGER = "Unable to nudge a leave request which has been approved | denied",
  INVALID_LEAVE_CANCEL_BY_MANAGER = "Invalid leave request status update by Manager",
  INVALID_LEAVE_REQUEST_STATUS_MANAGER = "Invalid leave request status update by Manager",
  ENTITLEMENT_NOT_APPLICABLE = "Leave Entitlement is not applicable for selected Date Range"
}
