import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";

export interface LeaveTypePayloadType {
  name: string;
  emojiCode: string;
  colorCode: string;
  calculationType: string;
  leaveDuration: LeaveDurationTypes;
  maxCarryForwardDays: number | undefined;
  carryForwardExpirationDays: number;
  carryForwardExpirationDate: string | null;
  isAttachment: boolean;
  isOverridden: boolean;
  isAttachmentMandatory: boolean;
  isCommentMandatory: boolean;
  isAutoApproval: boolean;
  isActive: boolean;
  isCarryForwardEnabled: boolean;
  isCarryForwardRemainingBalanceEnabled: boolean;
}

export interface LeaveTypeType extends LeaveTypePayloadType {
  typeId: number;
}

export interface LeaveTypeFormDataType extends LeaveTypeType {
  emoji: string;
}

export interface LeaveTypesWithToggleType {
  labels: string[];
  toggle: Record<string, boolean>;
  colorArray: string[];
  transformedData: Record<string, string>;
  extractedData: ExtractedDataType[];
  allId: number[];
}

export type ExtractedDataType = {
  typeId: string;
  name: string;
};
