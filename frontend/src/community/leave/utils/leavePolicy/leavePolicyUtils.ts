import {
  MAX_POLICY_DAYS,
  MAX_POLICY_NAME_LENGTH
} from "~community/leave/constants/leavePolicyConstants";
import {
  AddLeavePolicyPayload,
  PolicyType,
  LeavePolicyFormData,
  LeavePolicyWizardErrors,
  LeavePolicyWizardSteps
} from "~community/leave/types/LeavePolicyTypes";

const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isPositiveNumber = (value: string): boolean =>
  value !== "" && !Number.isNaN(Number(value)) && Number(value) > 0;

export const getLeavePolicyStepErrors = (
  step: LeavePolicyWizardSteps,
  formData: LeavePolicyFormData
): LeavePolicyWizardErrors => {
  const errors: LeavePolicyWizardErrors = {};

  switch (step) {
    case LeavePolicyWizardSteps.BASIC_INFO: {
      if (formData.policyType === null) {
        errors.policyType = "policyTypeRequired";
      }
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
      if (formData.policyType === PolicyType.FIXED) {
        if (formData.totalDaysAllocated === "") {
          errors.totalDaysAllocated = "totalDaysRequired";
        } else if (!isPositiveNumber(formData.totalDaysAllocated)) {
          errors.totalDaysAllocated = "totalDaysInvalid";
        } else if (Number(formData.totalDaysAllocated) > MAX_POLICY_DAYS) {
          errors.totalDaysAllocated = "totalDaysMax";
        }
      } else {
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
      }
      break;
    }
    case LeavePolicyWizardSteps.CARRY_FORWARD: {
      if (formData.isCarryForwardEnabled) {
        if (!isPositiveNumber(formData.maxCarryForwardDays)) {
          errors.maxCarryForwardDays = "maxCarryForwardDaysRequired";
        }
        if (!formData.carryForwardExpiryDate) {
          errors.carryForwardExpiryDate = "expiryDateRequired";
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (formData.carryForwardExpiryDate <= today) {
            errors.carryForwardExpiryDate = "expiryDatePast";
          }
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
  const isFixed =
    formData.policyType === PolicyType.FIXED;

  const payload: AddLeavePolicyPayload = {
    name: formData.policyName.trim(),
    leaveTypeId: Number(formData.leaveType),
    policyType:
      formData.policyType ?? PolicyType.FIXED,
    carryForwardEnabled: formData.isCarryForwardEnabled
  };

  if (formData.isCarryForwardEnabled && formData.carryForwardExpiryDate) {
    payload.maxCarryForwardDays = Number(formData.maxCarryForwardDays);
    payload.carryForwardExpiryDate = toISODateString(
      formData.carryForwardExpiryDate
    );
  }

  if (isFixed) {
    payload.fixedDaysAllocated = Number(formData.totalDaysAllocated);
  } else {
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
      resetNegativeOnCarryover: formData.canCarryOver
        ? formData.resetNegativeBalances
        : false,
      firstAccrual: formData.firstAccrual,
      accrualTiming: formData.receiveAccruedTime
    };
  }

  return payload;
};
