import {
  HTTP_CONFLICT,
  HTTP_FORBIDDEN
} from "~community/common/constants/httpStatusCodes";
import {
  AddLeavePolicyPayload,
  LeavePolicyFormData,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

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
