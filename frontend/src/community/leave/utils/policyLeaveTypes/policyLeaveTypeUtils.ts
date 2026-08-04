import { AxiosError } from "axios";

import {
  COMMON_ERROR_ACCESS_DENIED,
  LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS
} from "~community/common/constants/errorMessageKeys";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import {
  PolicyLeaveTypeFormDataType,
  PolicyLeaveTypePayloadType
} from "~community/leave/types/PolicyLeaveTypeTypes";

interface PolicyLeaveTypeErrorData {
  results?: { messageKey?: string }[];
}

interface PolicyLeaveTypeErrorToastKeys {
  title: string;
  description: string;
}

export const getPolicyLeaveTypeErrorToastKeys = (
  error: AxiosError
): PolicyLeaveTypeErrorToastKeys => {
  const errorData = error?.response?.data as
    | PolicyLeaveTypeErrorData
    | undefined;
  const messageKey = errorData?.results?.[0]?.messageKey;

  switch (messageKey) {
    case LEAVE_ERROR_POLICY_LEAVE_TYPE_ALREADY_EXISTS:
      return {
        title: "duplicateToastTitle",
        description: "duplicateToastDescription"
      };
    case COMMON_ERROR_ACCESS_DENIED:
      return {
        title: "permissionToastTitle",
        description: "permissionToastDescription"
      };
    default:
      return { title: "errorToastTitle", description: "errorToastDescription" };
  }
};

export const getMinDurationTranslationKeys = (
  minDuration: LeaveDurationTypes
): string[] => {
  switch (minDuration) {
    case LeaveDurationTypes.HALF_DAY:
      return ["halfDay"];
    case LeaveDurationTypes.FULL_DAY:
      return ["fullDay"];
    case LeaveDurationTypes.HALF_AND_FULL_DAY:
      return ["fullDay", "halfDay"];
    default:
      return [];
  }
};

/**
 * Half-day and full-day are independent choices that combine into a single
 * enum value, so clicking one toggles it on or off within the current pair.
 */
export const getUpdatedMinDuration = (
  currentDuration: LeaveDurationTypes,
  selectedDuration: LeaveDurationTypes
): LeaveDurationTypes => {
  if (currentDuration === LeaveDurationTypes.NONE) {
    return selectedDuration;
  }

  if (currentDuration === selectedDuration) {
    return LeaveDurationTypes.NONE;
  }

  if (currentDuration === LeaveDurationTypes.HALF_AND_FULL_DAY) {
    return selectedDuration === LeaveDurationTypes.HALF_DAY
      ? LeaveDurationTypes.FULL_DAY
      : LeaveDurationTypes.HALF_DAY;
  }

  return LeaveDurationTypes.HALF_AND_FULL_DAY;
};

export const isMinDurationSelected = (
  currentDuration: LeaveDurationTypes,
  duration: LeaveDurationTypes
): boolean =>
  currentDuration === LeaveDurationTypes.HALF_AND_FULL_DAY ||
  currentDuration === duration;

export const mapPolicyLeaveTypeFormToPayload = (
  formData: PolicyLeaveTypeFormDataType
): PolicyLeaveTypePayloadType => ({
  name: formData.name.trim(),
  emojiCode: formData.emojiCode,
  colorCode: formData.colorCode,
  minDuration: formData.minDuration,
  isAttachment: formData.isAttachment,
  isAttachmentMust: formData.isAttachment ? formData.isAttachmentMust : false,
  isCommentMust: formData.isCommentMust,
  isAutoApproval: formData.isAutoApproval
});
