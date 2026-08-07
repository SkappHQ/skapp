import { SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { FileUploadType } from "~community/common/types/CommonTypes";
import { ToastProps } from "~community/common/types/ToastTypes";
import { ApplyPolicyLeaveErrorKeys } from "~community/leave/enums/MyRequestEnums";
import { PolicyLeaveToastEnums } from "~community/leave/enums/PolicyLeaveEnums";
import {
  PolicyLeaveFormErrors,
  initialPolicyLeaveFormErrors
} from "~community/leave/store/policyLeaveStore";
import {
  EmployeePolicyBalanceType,
  PolicyBalanceDisabledReason,
  PolicyLeaveRequestStatus,
  PolicyLeaveValidationFailure
} from "~community/leave/types/PolicyLeaveTypes";

type TranslateFn = (key: string[], data?: Record<string, unknown>) => string;

interface DisabledReasonToastKeys {
  titleKey: string;
  descriptionKey: string;
}

interface AvailabilityErrorMessageProps {
  failureReason: PolicyLeaveValidationFailure | null;
  remainingBalance: number;
  policyName: string;
  translateText: TranslateFn;
}

interface HandlePolicyLeaveToastProps {
  type: PolicyLeaveToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: TranslateFn;
}

interface PolicyLeaveToastConfig {
  toastType: ToastType;
  titleKey: string;
  descriptionKey: string;
  autoHideDuration?: number;
}

interface PolicyLeaveFormErrorsProps {
  selectedDatesLength: number;
  comment: string;
  attachments: FileUploadType[];
  policyBalance: EmployeePolicyBalanceType | null;
  availabilityError: string;
  translateText: TranslateFn;
}

const SUCCESS_TOAST_DURATION_MS = 4000;

const ERROR_TOAST_NO_AUTO_DISMISS_MS = 24 * 60 * 60 * 1000;

export const policyLeaveStatusFilters: PolicyLeaveRequestStatus[] = [
  PolicyLeaveRequestStatus.PENDING,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

export const getDisabledReasonToastKeys = (
  reason: PolicyBalanceDisabledReason | null
): DisabledReasonToastKeys => {
  switch (reason) {
    case PolicyBalanceDisabledReason.ALLOCATION_PERIOD_EXPIRED:
      return {
        titleKey: "expiredError.title",
        descriptionKey: "expiredError.description"
      };
    case PolicyBalanceDisabledReason.NO_SUPERVISOR_ASSIGNED:
      return {
        titleKey: "noSupervisorError.title",
        descriptionKey: "noSupervisorError.description"
      };
    case PolicyBalanceDisabledReason.POLICY_INACTIVE:
      return {
        titleKey: "policyInactiveError.title",
        descriptionKey: "policyInactiveError.description"
      };
    case PolicyBalanceDisabledReason.FULLY_UTILIZED:
    default:
      return {
        titleKey: "fullyUtilizedError.title",
        descriptionKey: "fullyUtilizedError.description"
      };
  }
};

export const getAvailabilityErrorMessage = ({
  failureReason,
  remainingBalance,
  policyName,
  translateText
}: AvailabilityErrorMessageProps): string => {
  switch (failureReason) {
    case PolicyLeaveValidationFailure.INSUFFICIENT_BALANCE:
      return translateText(["errors.insufficientBalance"], {
        days: remainingBalance,
        policyName
      });
    case PolicyLeaveValidationFailure.OUTSIDE_POLICY_PERIOD:
      return translateText(["errors.outsidePolicyPeriod"], { policyName });
    case PolicyLeaveValidationFailure.OVERLAPPING_REQUEST:
      return translateText(["errors.overlappingRequest"]);
    case PolicyLeaveValidationFailure.NO_WORKING_DAYS:
      return translateText(["errors.noWorkingDays"]);
    case PolicyLeaveValidationFailure.INVALID_DATE_RANGE:
      return translateText(["errors.invalidDateRange"]);
    default:
      return "";
  }
};

export const mapApplyErrorKeyToToastType = (
  messageKey: string
): PolicyLeaveToastEnums => {
  switch (messageKey) {
    case ApplyPolicyLeaveErrorKeys.POLICY_NOT_ASSIGNED:
      return PolicyLeaveToastEnums.POLICY_NOT_ASSIGNED;
    case ApplyPolicyLeaveErrorKeys.INSUFFICIENT_BALANCE:
      return PolicyLeaveToastEnums.INSUFFICIENT_BALANCE;
    case ApplyPolicyLeaveErrorKeys.NOT_APPLICABLE:
      return PolicyLeaveToastEnums.NOT_APPLICABLE;
    case ApplyPolicyLeaveErrorKeys.REQUEST_OVERLAP:
      return PolicyLeaveToastEnums.REQUEST_OVERLAP;
    case ApplyPolicyLeaveErrorKeys.OUTSIDE_POLICY_PERIOD:
      return PolicyLeaveToastEnums.OUTSIDE_POLICY_PERIOD;
    default:
      return PolicyLeaveToastEnums.APPLY_ERROR;
  }
};

export const handlePolicyLeaveToast = ({
  type,
  setToastMessage,
  translateText
}: HandlePolicyLeaveToastProps): void => {
  const toastConfig: Record<PolicyLeaveToastEnums, PolicyLeaveToastConfig> = {
    [PolicyLeaveToastEnums.APPLY_SUCCESS]: {
      toastType: ToastType.SUCCESS,
      titleKey: "toastMessages.applySuccess.title",
      descriptionKey: "toastMessages.applySuccess.description",
      autoHideDuration: SUCCESS_TOAST_DURATION_MS
    },
    [PolicyLeaveToastEnums.APPLY_ERROR]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.applyError.title",
      descriptionKey: "toastMessages.applyError.description"
    },
    [PolicyLeaveToastEnums.SESSION_EXPIRED]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.sessionExpired.title",
      descriptionKey: "toastMessages.sessionExpired.description"
    },
    [PolicyLeaveToastEnums.POLICY_NOT_ASSIGNED]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.policyNotAssigned.title",
      descriptionKey: "toastMessages.policyNotAssigned.description"
    },
    [PolicyLeaveToastEnums.INSUFFICIENT_BALANCE]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.insufficientBalance.title",
      descriptionKey: "toastMessages.insufficientBalance.description"
    },
    [PolicyLeaveToastEnums.NOT_APPLICABLE]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.notApplicable.title",
      descriptionKey: "toastMessages.notApplicable.description"
    },
    [PolicyLeaveToastEnums.REQUEST_OVERLAP]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.requestOverlap.title",
      descriptionKey: "toastMessages.requestOverlap.description"
    },
    [PolicyLeaveToastEnums.OUTSIDE_POLICY_PERIOD]: {
      toastType: ToastType.ERROR,
      titleKey: "toastMessages.outsidePolicyPeriod.title",
      descriptionKey: "toastMessages.outsidePolicyPeriod.description"
    }
  };

  const config = toastConfig[type];

  setToastMessage({
    open: true,
    toastType: config.toastType,
    title: translateText([config.titleKey]),
    description: translateText([config.descriptionKey]),
    autoHideDuration:
      config.autoHideDuration ??
      (config.toastType === ToastType.ERROR
        ? ERROR_TOAST_NO_AUTO_DISMISS_MS
        : undefined)
  });
};

export const getPolicyLeaveFormErrors = ({
  selectedDatesLength,
  comment,
  attachments,
  policyBalance,
  availabilityError,
  translateText
}: PolicyLeaveFormErrorsProps): PolicyLeaveFormErrors => {
  const errors: PolicyLeaveFormErrors = { ...initialPolicyLeaveFormErrors };

  if (selectedDatesLength === 0) {
    errors.selectedDates = translateText(["errors.datesRequired"]);
  } else if (availabilityError) {
    errors.selectedDates = availabilityError;
  }

  if (policyBalance?.leaveType?.isCommentMust && !comment.trim()) {
    errors.comment = translateText(["errors.commentRequired"]);
  }

  if (policyBalance?.leaveType?.isAttachmentMust && attachments.length === 0) {
    errors.attachment = translateText(["errors.attachmentRequired"]);
  }

  return errors;
};

export const hasPolicyLeaveFormErrors = (
  errors: PolicyLeaveFormErrors
): boolean => Object.values(errors).some((error) => error !== "");
