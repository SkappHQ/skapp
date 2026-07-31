import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";

export interface PolicyLeaveTypeSettingsType {
  id: number;
  name: string;
  emojiCode: string | null;
  colorCode: string | null;
  minDuration: LeaveDurationTypes;
  isAttachment: boolean;
  isAttachmentMust: boolean;
  isCommentMust: boolean;
  isAutoApproval: boolean;
  isActive: boolean;
}

export interface PolicyLeaveTypePayloadType {
  name: string;
  emojiCode: string;
  colorCode: string;
  minDuration: LeaveDurationTypes;
  isAttachment: boolean;
  isAttachmentMust: boolean;
  isCommentMust: boolean;
  isAutoApproval: boolean;
}

export interface PolicyLeaveTypeFormDataType extends PolicyLeaveTypePayloadType {
  emoji: string;
}

export interface PolicyLeaveTypesPage {
  items: PolicyLeaveTypeSettingsType[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface SearchPolicyLeaveTypesParams {
  searchKeyword?: string;
  isActive?: boolean;
  page: number;
  size: number;
}

export interface SearchPolicyLeaveTypesResponse {
  results: PolicyLeaveTypesPage[];
}

export interface PolicyLeaveTypeMutationResponse {
  results: PolicyLeaveTypeSettingsType[];
}

export interface PolicyLeaveTypeStatusResponse {
  results: { id: number; isActive: boolean }[];
}

export interface UpdatePolicyLeaveTypeVariables {
  id: number;
  payload: PolicyLeaveTypePayloadType;
}
