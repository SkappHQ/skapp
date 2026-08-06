import { LeaveStates } from "~community/common/types/CommonTypes";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

export enum PolicyBalanceDisabledReason {
  FULLY_UTILIZED = "FULLY_UTILIZED",
  ALLOCATION_PERIOD_EXPIRED = "ALLOCATION_PERIOD_EXPIRED",
  NO_SUPERVISOR_ASSIGNED = "NO_SUPERVISOR_ASSIGNED",
  POLICY_INACTIVE = "POLICY_INACTIVE"
}

export enum PolicyLeaveValidationFailure {
  INVALID_DATE_RANGE = "INVALID_DATE_RANGE",
  OUTSIDE_POLICY_PERIOD = "OUTSIDE_POLICY_PERIOD",
  NO_WORKING_DAYS = "NO_WORKING_DAYS",
  OVERLAPPING_REQUEST = "OVERLAPPING_REQUEST",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE"
}

export enum PolicyLeaveRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  CANCELLED = "CANCELLED",
  REVOKED = "REVOKED"
}

export interface PolicyLeaveTypeDetailType {
  id: number;
  name: string;
  emojiCode: string;
  colorCode: string;
  minDuration: LeaveDurationTypes;
  isAttachment: boolean;
  isAttachmentMust: boolean;
  isCommentMust: boolean;
  isAutoApproval: boolean;
}

export interface EmployeePolicyBalanceType {
  assignmentId: number;
  policyId: number;
  policyName: string;
  policyType: PolicyType;
  leaveType: PolicyLeaveTypeDetailType;
  year: number;
  effectiveFrom: string;
  validFrom: string;
  validTo: string;
  carriedForwardDays: number;
  accruedDays: number;
  totalDaysAllocated: number;
  totalDaysUsed: number;
  balanceInDays: number;
  isUnlimited: boolean;
  isBalanceAvailable: boolean;
  isDisabled: boolean;
  disabledReason: PolicyBalanceDisabledReason | null;
}

export interface PolicyLeaveAvailabilityPayload {
  policyId: number;
  startDate: string;
  endDate: string;
  leaveState: LeaveStates;
}

export interface PolicyLeaveAvailabilityType {
  policyId: number;
  policyName: string;
  requestedDays: number | null;
  remainingBalance: number;
  balanceAfterRequest: number | null;
  validFrom: string;
  validTo: string;
  isValid: boolean;
  failureReason: PolicyLeaveValidationFailure | null;
}

export interface PolicyLeaveAttachmentPayload {
  fileUrl: string;
  originalFileName: string;
}

export interface PolicyLeaveAttachmentType
  extends PolicyLeaveAttachmentPayload {
  id: number;
}

export interface PolicyLeaveRequestPayload {
  policyId: number;
  startDate: string;
  endDate: string;
  leaveState: LeaveStates;
  requestDesc: string;
  attachments: PolicyLeaveAttachmentPayload[];
}

export interface PolicyLeaveRequestType {
  leaveRequestId: number;
  policyId: number;
  policyName: string;
  leaveType: PolicyLeaveTypeDetailType;
  startDate: string;
  endDate: string;
  leaveState: LeaveStates;
  status: PolicyLeaveRequestStatus;
  durationDays: number;
  requestDesc: string | null;
  reviewerComment: string | null;
  reviewedDate: string | null;
  isViewed: boolean;
  isAutoApproved: boolean;
  createdDate: string;
  attachments: PolicyLeaveAttachmentType[];
  remainingBalance: number | null;
}

export interface PolicyLeaveRequestPageType {
  items: PolicyLeaveRequestType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
