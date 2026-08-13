import {
  LeaveStates,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeaveAttachmentType,
  PolicyLeaveRequestStatus,
  PolicyLeaveTypeDetailType
} from "~community/leave/types/PolicyLeaveTypes";

export type PolicyLeavePopupType =
  | PolicyLeaveRequestStatus
  | PolicyLeaveReviewModalEnums;

export interface PolicyLeaveSummaryLayout {
  descriptionKey?: string;
  containerMarginTop?: string;
  showDateApplied: boolean;
  showDateApproved: boolean;
  showReason: boolean;
  showAttachments: boolean;
  isRecipientTopAligned: boolean;
  usesArrowRightIcon: boolean;
}

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
  searchKeyword?: string;
}

export interface PolicyLeaveReviewPayload {
  leaveRequestId: number;
  status: PolicyLeaveRequestStatus;
  reviewerComment?: string;
}

export interface PolicyLeaveNudgeStatusType {
  isNudge: boolean;
  lastNudgedDateTime: string | null;
}

export interface PolicyLeaveNudgeStatusResponse {
  results: PolicyLeaveNudgeStatusType[];
}
