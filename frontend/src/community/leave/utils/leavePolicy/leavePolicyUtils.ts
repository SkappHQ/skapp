import {
  HTTP_CONFLICT,
  HTTP_FORBIDDEN
} from "~community/common/constants/httpStatusCodes";
import {
  MAX_POLICY_DAYS,
  MAX_POLICY_NAME_LENGTH,
  MIN_ACCRUAL_CAP_DAYS,
  MIN_POLICY_DAYS,
  MIN_WAITING_PERIOD_DAYS
} from "~community/leave/constants/leavePolicyConstants";
import {
  AddLeavePolicyPayload,
  LeavePolicyFormData,
  LeavePolicyWizardErrors,
  LeavePolicyWizardSteps,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

const isNumberInRange = (value: string, min: number, max?: number): boolean => {
  const numericValue = Number(value);
  return (
    value !== "" &&
    !Number.isNaN(numericValue) &&
    numericValue >= min &&
    (max === undefined || numericValue <= max)
  );
};

export const getLeavePolicyErrorToastKeys = (
  status: number | undefined
): { title: string; description: string } => {
  switch (status) {
    case HTTP_CONFLICT:
      return {
        title: "duplicateToastTitle",
        description: "duplicateToastDescription"
      };
    case HTTP_FORBIDDEN:
      return {
        title: "permissionToastTitle",
        description: "permissionToastDescription"
      };
    default:
      return { title: "errorToastTitle", description: "errorToastDescription" };
  }
};

export const buildTranslatedOptionList = (
  itemList: { id: string; labelKey: string; value: string }[],
  optionGroup: string,
  translateOptions: (suffixes: string[]) => string
): { id: string; label: string; value: string }[] =>
  itemList.map((item) => ({
    id: item.id,
    label: translateOptions([optionGroup, item.labelKey]),
    value: item.value
  }));

export const getLeavePolicyStepErrors = (
  step: LeavePolicyWizardSteps,
  formData: LeavePolicyFormData
): LeavePolicyWizardErrors => {
  const errors: LeavePolicyWizardErrors = {};

  switch (step) {
    case LeavePolicyWizardSteps.BASIC_INFO: {
      if (!formData.policyName.trim()) {
        errors.policyName = "policyNameRequired";
      } else if (formData.policyName.trim().length > MAX_POLICY_NAME_LENGTH) {
        errors.policyName = "policyNameMaxLength";
      }
      if (!formData.leaveType) {
        errors.leaveType = "leaveTypeRequired";
      }
      break;
    }
    case LeavePolicyWizardSteps.ENTITLEMENT_SETUP: {
      if (formData.policyType === PolicyType.ACCRUAL) {
        if (formData.accrualDays === "") {
          errors.accrualDays = "accrualDaysRequired";
        } else if (
          !isNumberInRange(
            formData.accrualDays,
            MIN_POLICY_DAYS,
            MAX_POLICY_DAYS
          )
        ) {
          errors.accrualDays = "accrualDaysInvalid";
        }
        if (!formData.accrualFrequency) {
          errors.accrualFrequency = "frequencyRequired";
        }
        if (
          formData.hasWaitingPeriod &&
          !isNumberInRange(formData.waitingPeriodDays, MIN_WAITING_PERIOD_DAYS)
        ) {
          errors.waitingPeriodDays = "waitingPeriodDaysRequired";
        }
        if (
          formData.hasAccrualCap &&
          !isNumberInRange(formData.accrualCapDays, MIN_ACCRUAL_CAP_DAYS)
        ) {
          errors.accrualCapDays = "accrualCapRequired";
        }
        if (
          formData.canCarryOver &&
          formData.maxCarryOverDays !== "" &&
          !isNumberInRange(
            formData.maxCarryOverDays,
            MIN_POLICY_DAYS,
            MAX_POLICY_DAYS
          )
        ) {
          errors.maxCarryOverDays = "maxCarryOverDaysInvalid";
        }
      }
      break;
    }
    default:
      break;
  }

  return errors;
};

export const mapLeavePolicyFormToPayload = (
  formData: LeavePolicyFormData
): AddLeavePolicyPayload => {
  const payload: AddLeavePolicyPayload = {
    name: formData.policyName.trim(),
    leaveTypeId: Number(formData.leaveType),
    policyType: formData.policyType ?? PolicyType.ACCRUAL
  };

  if (formData.policyType === PolicyType.ACCRUAL) {
    payload.accrual = {
      accrualDays: Number(formData.accrualDays),
      frequency: formData.accrualFrequency,
      waitingPeriodDays: formData.hasWaitingPeriod
        ? Math.round(Number(formData.waitingPeriodDays))
        : undefined,
      accrualCapDays: formData.hasAccrualCap
        ? Number(formData.accrualCapDays)
        : undefined,
      isCarryoverEnabled: formData.canCarryOver,
      carryoverDate: formData.canCarryOver ? formData.carryOverDate : undefined,
      maxCarryoverDays:
        formData.canCarryOver && formData.maxCarryOverDays !== ""
          ? Number(formData.maxCarryOverDays)
          : undefined,
      firstAccrual: formData.firstAccrual,
      accrualTiming: formData.receiveAccruedTime
    };
  }

  return payload;
};
