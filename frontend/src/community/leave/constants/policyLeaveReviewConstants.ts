import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import {
  PolicyLeavePopupType,
  PolicyLeaveSummaryLayout
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

export const STATUS_POPUP_TYPES: PolicyLeaveRequestStatus[] = [
  PolicyLeaveRequestStatus.PENDING,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

export const SUMMARY_LAYOUTS: Record<string, PolicyLeaveSummaryLayout> = {
  [PolicyLeaveRequestStatus.APPROVED]: {
    containerMarginTop: "1.25rem",
    showDateApplied: true,
    showDateApproved: true,
    showReason: true,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveRequestStatus.DENIED]: {
    containerMarginTop: "1rem",
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
    containerMarginTop: "1rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: false,
    usesArrowRightIcon: true
  },
  [PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY]: {
    descriptionKey: "leaveRequestCancelledDescription",
    containerMarginTop: "1.25rem",
    showDateApplied: false,
    showDateApproved: false,
    showReason: false,
    showAttachments: true,
    isRecipientTopAligned: true,
    usesArrowRightIcon: false
  },
  [PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED]: {
    descriptionKey: "supervisorNudgedDescription",
    containerMarginTop: "1.25rem",
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
