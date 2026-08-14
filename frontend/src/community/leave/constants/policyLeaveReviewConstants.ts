import { IconName } from "~community/common/types/IconTypes";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeavePopupType,
  PolicyLeaveResultStatus,
  PolicyLeaveSummaryLayout
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

export const RESULT_STATUS_ICON_NAMES: Record<
  PolicyLeaveResultStatus,
  IconName
> = {
  [PolicyLeaveRequestStatus.APPROVED]: IconName.APPROVED_STATUS_ICON,
  [PolicyLeaveRequestStatus.DENIED]: IconName.DENIED_STATUS_ICON,
  [PolicyLeaveRequestStatus.CANCELLED]: IconName.CANCELLED_STATUS_ICON,
  [PolicyLeaveRequestStatus.REVOKED]: IconName.REVOKED_STATUS_ICON
};

export const POLICY_LEAVE_CHIP_STYLES = {
  backgroundColor: "grey.100",
  py: "0.75rem"
};

export const POLICY_LEAVE_ATTACHMENT_CHIP_STYLES = {
  ...POLICY_LEAVE_CHIP_STYLES,
  px: "0.75rem"
};

export const STATUS_POPUP_TYPES: PolicyLeaveRequestStatus[] = [
  PolicyLeaveRequestStatus.PENDING,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

export const SUMMARY_LAYOUTS: Record<string, PolicyLeaveSummaryLayout> = {
  [PolicyLeaveRequestStatus.APPROVED]: {
    containerMarginTopClass: "mt-5",
    showDateApplied: true,
    showDateApproved: true,
    showReason: true,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveRequestStatus.DENIED]: {
    containerMarginTopClass: "mt-4",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: false,
    isRecipientTopAligned: false,
    usesArrowRightIcon: true
  },
  [PolicyLeaveRequestStatus.REVOKED]: {
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: false,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveRequestStatus.CANCELLED]: {
    containerMarginTopClass: "mt-4",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: false,
    usesArrowRightIcon: true
  },
  [PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY]: {
    descriptionKey: "leaveRequestCancelledDescription",
    containerMarginTopClass: "mt-5",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED]: {
    descriptionKey: "supervisorNudgedDescription",
    containerMarginTopClass: "mt-5",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  }
};

export const SUMMARY_POPUP_TYPES = Object.keys(
  SUMMARY_LAYOUTS
) as PolicyLeavePopupType[];

export const REVIEW_RESULT_POPUP_TYPES: PolicyLeavePopupType[] = [
  PolicyLeaveReviewModalEnums.APPROVED_STATUS,
  PolicyLeaveReviewModalEnums.DECLINE_STATUS,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

export const MANAGER_REVIEW_MODAL_TITLE_KEYS: Partial<
  Record<PolicyLeavePopupType, string>
> = {
  [PolicyLeaveRequestStatus.PENDING]: "approveModalTitle",
  [PolicyLeaveReviewModalEnums.DECLINE]: "declineModalTitle",
  [PolicyLeaveRequestStatus.APPROVED]: "approvedModalTitle",
  [PolicyLeaveReviewModalEnums.APPROVED_STATUS]: "approvedModalTitle",
  [PolicyLeaveRequestStatus.DENIED]: "deniedModalTitle",
  [PolicyLeaveReviewModalEnums.DECLINE_STATUS]: "deniedModalTitle",
  [PolicyLeaveRequestStatus.REVOKED]: "revokedModalTitle",
  [PolicyLeaveRequestStatus.CANCELLED]: "cancelledModalTitle"
};

export const EMPLOYEE_STATUS_MODAL_TITLE_KEYS: Partial<
  Record<PolicyLeavePopupType, string>
> = {
  [PolicyLeaveRequestStatus.APPROVED]: "leaveApproved",
  [PolicyLeaveRequestStatus.PENDING]: "approvalPending",
  [PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED]: "supervisorNudged",
  [PolicyLeaveRequestStatus.CANCELLED]: "cancelledLeaveStatus",
  [PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP]: "confirmCancellation",
  [PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY]: "leaveRequestCancelled",
  [PolicyLeaveRequestStatus.REVOKED]: "revokedLeaveStatus",
  [PolicyLeaveRequestStatus.DENIED]: "deniedLeaveStatus"
};
