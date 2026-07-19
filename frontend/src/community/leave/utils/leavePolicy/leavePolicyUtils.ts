import {
  MAX_POLICY_DAYS,
  MAX_POLICY_NAME_LENGTH
} from "~community/leave/constants/leavePolicyConstants";
import {
  AddLeavePolicyPayload,
  LeavePolicyFormData,
  LeavePolicyWizardErrors,
  LeavePolicyWizardSteps,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

const isPositiveNumber = (value: string): boolean =>
  value !== "" && !Number.isNaN(Number(value)) && Number(value) > 0;

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
          !isPositiveNumber(formData.accrualDays) ||
          Number(formData.accrualDays) > MAX_POLICY_DAYS
        ) {
          errors.accrualDays = "accrualDaysInvalid";
        }
        if (!formData.accrualFrequency) {
          errors.accrualFrequency = "frequencyRequired";
        }
        if (
          formData.hasWaitingPeriod &&
          !isPositiveNumber(formData.waitingPeriodDays)
        ) {
          errors.waitingPeriodDays = "waitingPeriodDaysRequired";
        }
        if (
          formData.hasAccrualCap &&
          !isPositiveNumber(formData.accrualCapDays)
        ) {
          errors.accrualCapDays = "accrualCapRequired";
        }
        if (
          formData.canCarryOver &&
          formData.maxCarryOverDays !== "" &&
          (!isPositiveNumber(formData.maxCarryOverDays) ||
            Number(formData.maxCarryOverDays) > MAX_POLICY_DAYS)
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
      carryoverEnabled: formData.canCarryOver,
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
