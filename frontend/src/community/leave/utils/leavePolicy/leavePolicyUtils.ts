import { AxiosError } from "axios";

import {
  COMMON_ERROR_ACCESS_DENIED,
  LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS
} from "~community/common/constants/errorMessageKeys";
import {
  AddLeavePolicyPayload,
  LeavePolicyFormData,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

interface LeavePolicyErrorData {
  results?: { messageKey?: string }[];
}

interface LeavePolicyErrorToastKeys {
  title: string;
  description: string;
}

export const getLeavePolicyErrorToastKeys = (
  error: AxiosError
): LeavePolicyErrorToastKeys => {
  const errorData = error?.response?.data as LeavePolicyErrorData | undefined;
  const messageKey = errorData?.results?.[0]?.messageKey;

  switch (messageKey) {
    case LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS:
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

interface TranslatableOptionItem {
  id: string;
  labelKey: string;
  value: string;
}

interface TranslatedOption {
  id: string;
  label: string;
  value: string;
}

export const buildTranslatedOptionList = (
  itemList: TranslatableOptionItem[],
  optionGroup: string,
  translateOptions: (suffixes: string[]) => string
): TranslatedOption[] =>
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
