import {
  LeaveStates,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import {
  PolicyLeaveAttachmentType,
  PolicyLeaveRequestStatus,
  PolicyLeaveTypeDetailType
} from "~community/leave/types/PolicyLeaveTypes";

export interface PolicyLeaveReviewEmployeeType {
  employeeId: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  authPic: string | null;
}

export interface PolicyManagerLeaveRequestType {
  leaveRequestId: number;
  employee: PolicyLeaveReviewEmployeeType;
  reviewer: PolicyLeaveReviewEmployeeType | null;
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
  isAutoApproved: boolean;
  createdDate: string;
}

export interface PolicyLeaveRequestDetailType extends PolicyManagerLeaveRequestType {
  attachments: PolicyLeaveAttachmentType[];
}

export interface PolicyManagerLeaveRequestPageType {
  items: PolicyManagerLeaveRequestType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PolicyManagerLeaveRequestPageResponse {
  results: PolicyManagerLeaveRequestPageType[];
}

export interface PolicyManagerLeaveRequestListResponse {
  results: PolicyManagerLeaveRequestType[];
}

export interface PolicyLeaveRequestDetailResponse {
  results: PolicyLeaveRequestDetailType[];
}

export interface PolicyManagerLeaveRequestQueryParams {
  page: number;
  size: number;
  sortKey: SortKeyTypes;
  sortOrder: SortOrderTypes;
  status?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PolicyLeaveReviewPayload {
  leaveRequestId: number;
  status: PolicyLeaveRequestStatus;
  reviewerComment?: string;
}

export interface PolicyLeaveCancelPayload {
  leaveRequestId: number;
}

export interface PolicyLeaveNudgeStatusType {
  isNudge: boolean;
  lastNudgedDateTime: string | null;
}

export interface PolicyLeaveNudgeStatusResponse {
  results: PolicyLeaveNudgeStatusType[];
}
