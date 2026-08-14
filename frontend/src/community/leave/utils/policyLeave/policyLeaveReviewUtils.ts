import { SetStateAction } from "react";

import { DAY_MONTH_YEAR_FORMAT } from "~community/attendance/constants/constants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";
import {
  PolicyLeaveReviewModalEnums,
  PolicyLeaveReviewToastEnums
} from "~community/leave/enums/PolicyLeaveReviewEnums";
import { EmployeeLeaveRequestType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import {
  PolicyLeavePopupType,
  PolicyLeaveResultStatus,
  PolicyLeaveReviewEmployeeType,
  PolicyLeaveReviewRequestParams,
  PolicyManagerLeaveRequestQueryParams
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";
import { TranslateFn } from "~community/leave/utils/policyLeave/policyLeaveUtils";

interface PolicyLeaveReviewToastConfig {
  toastType: ToastType;
  titleKey: string[];
  descriptionKey: string[];
}

interface HandlePolicyLeaveReviewToastProps {
  type: PolicyLeaveReviewToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: TranslateFn;
}

const managerKey = (key: string): string[] => [
  "leaveRequests",
  "leaveManagerEmployee",
  key
];

const myRequestKey = (key: string): string[] => [
  "myRequests",
  "myLeaveRequests",
  key
];

const REVIEW_TOAST_CONFIG: Record<
  PolicyLeaveReviewToastEnums,
  PolicyLeaveReviewToastConfig
> = {
  [PolicyLeaveReviewToastEnums.APPROVE_SUCCESS]: {
    toastType: ToastType.SUCCESS,
    titleKey: managerKey("approveLeaveSuccessTitle"),
    descriptionKey: managerKey("approveLeaveSuccessDesc")
  },
  [PolicyLeaveReviewToastEnums.APPROVE_ERROR]: {
    toastType: ToastType.ERROR,
    titleKey: managerKey("approveLeaveFailTitle"),
    descriptionKey: managerKey("approveLeaveFailDesc")
  },
  [PolicyLeaveReviewToastEnums.DECLINE_SUCCESS]: {
    toastType: ToastType.SUCCESS,
    titleKey: managerKey("declineLeaveSuccessTitle"),
    descriptionKey: managerKey("declineLeaveSuccessDesc")
  },
  [PolicyLeaveReviewToastEnums.DECLINE_ERROR]: {
    toastType: ToastType.ERROR,
    titleKey: managerKey("declineLeaveFailTitle"),
    descriptionKey: managerKey("declineLeaveFailDesc")
  },
  [PolicyLeaveReviewToastEnums.REVOKE_SUCCESS]: {
    toastType: ToastType.SUCCESS,
    titleKey: managerKey("revokeLeaveSuccessTitle"),
    descriptionKey: managerKey("revokeLeaveSuccessDesc")
  },
  [PolicyLeaveReviewToastEnums.REVOKE_ERROR]: {
    toastType: ToastType.ERROR,
    titleKey: managerKey("revokeLeaveFailTitle"),
    descriptionKey: managerKey("revokeLeaveFailDesc")
  },
  [PolicyLeaveReviewToastEnums.CANCEL_SUCCESS]: {
    toastType: ToastType.SUCCESS,
    titleKey: myRequestKey("leaveCancelSuccessTitle"),
    descriptionKey: myRequestKey("leaveCancelSuccessDescription")
  },
  [PolicyLeaveReviewToastEnums.CANCEL_ERROR]: {
    toastType: ToastType.ERROR,
    titleKey: myRequestKey("leaveCancelErrorTitle"),
    descriptionKey: myRequestKey("leaveCancelErrorDescription")
  },
  [PolicyLeaveReviewToastEnums.NUDGE_SUCCESS]: {
    toastType: ToastType.SUCCESS,
    titleKey: myRequestKey("nudgeSuccessTitle"),
    descriptionKey: myRequestKey("nudgeSuccessDescription")
  },
  [PolicyLeaveReviewToastEnums.NUDGE_ERROR]: {
    toastType: ToastType.ERROR,
    titleKey: myRequestKey("nudgeErrorTitle"),
    descriptionKey: myRequestKey("nudgeErrorDescription")
  }
};

export const handlePolicyLeaveReviewToast = ({
  type,
  setToastMessage,
  translateText
}: HandlePolicyLeaveReviewToastProps): void => {
  const config = REVIEW_TOAST_CONFIG[type];

  setToastMessage({
    open: true,
    toastType: config.toastType,
    title: translateText(config.titleKey),
    description: translateText(config.descriptionKey),
    isIcon: true
  });
};

export const isApprovedPopupType = (popupType: PolicyLeavePopupType): boolean =>
  popupType === PolicyLeaveRequestStatus.APPROVED ||
  popupType === PolicyLeaveReviewModalEnums.APPROVED_STATUS;

export const isDeniedPopupType = (popupType: PolicyLeavePopupType): boolean =>
  popupType === PolicyLeaveRequestStatus.DENIED ||
  popupType === PolicyLeaveReviewModalEnums.DECLINE_STATUS;

export const getPolicyLeaveResultStatus = (
  popupType: PolicyLeavePopupType
): PolicyLeaveResultStatus => {
  if (isApprovedPopupType(popupType)) {
    return PolicyLeaveRequestStatus.APPROVED;
  }

  if (popupType === PolicyLeaveRequestStatus.CANCELLED) {
    return PolicyLeaveRequestStatus.CANCELLED;
  }

  if (isDeniedPopupType(popupType)) {
    return PolicyLeaveRequestStatus.DENIED;
  }

  return PolicyLeaveRequestStatus.REVOKED;
};

export const getPolicyManagerLeaveRequestQueryParams = (
  params: PolicyLeaveReviewRequestParams
): PolicyManagerLeaveRequestQueryParams => {
  const { status, leaveTypeId, startDate, endDate, ...rest } = params;

  return {
    ...rest,
    status: status.length ? status.join(",") : undefined,
    leaveTypeId: leaveTypeId.length ? leaveTypeId.join(",") : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };
};

export const formatOptionalDate = (value: string | null): string => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : convertDateToFormat(date, DAY_MONTH_YEAR_FORMAT);
};

/** StatusPopupRow types the reviewer with a non nullable avatar. */
export const toStatusPopupReviewer = (
  reviewer: PolicyLeaveReviewEmployeeType | null
): EmployeeLeaveRequestType | undefined =>
  reviewer
    ? {
        employeeId: reviewer.employeeId,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        middleName: reviewer.middleName,
        authPic: reviewer.authPic ?? ""
      }
    : undefined;
