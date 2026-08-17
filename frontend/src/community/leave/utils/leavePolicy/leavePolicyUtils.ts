import { AxiosError } from "axios";
import { DateTime } from "luxon";

import {
  COMMON_ERROR_ACCESS_DENIED,
  LEAVE_ERROR_LEAVE_POLICY_ALREADY_EXISTS
} from "~community/common/constants/errorMessageKeys";
import {
  CARRYOVER_EXPIRY_DATE_FORMAT,
  CARRYOVER_EXPIRY_DISPLAY_FORMAT,
  CARRYOVER_EXPIRY_REFERENCE_YEAR
} from "~community/leave/constants/leavePolicyConstants";
import {
  AddLeavePolicyPayload,
  LeavePolicyFormData,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

/**
 * Turns the date the admin picked into the stored month-day. Only the month and day are
 * kept, so the expiry recurs every leave cycle instead of needing to be re-entered.
 */
export const toCarryoverExpiryMonthDay = (isoDate: string): string => {
  // setZone keeps the offset the picker emitted, so the month-day is the day the admin
  // clicked rather than that day shifted into another zone.
  const pickedDate = DateTime.fromISO(isoDate, { setZone: true });
  return pickedDate.isValid
    ? pickedDate.toFormat(CARRYOVER_EXPIRY_DATE_FORMAT)
    : "";
};

/**
 * Reads a stored month-day back into a date the picker can show. It is resolved against a
 * leap year so 29 February is never dropped; the picker hides the year.
 */
export const parseCarryoverExpiryDate = (
  monthDay: string
): DateTime | undefined => {
  if (!monthDay) {
    return undefined;
  }

  const expiryDate = DateTime.fromFormat(
    `${monthDay}-${CARRYOVER_EXPIRY_REFERENCE_YEAR}`,
    `${CARRYOVER_EXPIRY_DATE_FORMAT}-yyyy`
  );

  return expiryDate.isValid ? expiryDate : undefined;
};

export const formatCarryoverExpiryDate = (monthDay: string): string =>
  parseCarryoverExpiryDate(monthDay)?.toFormat(
    CARRYOVER_EXPIRY_DISPLAY_FORMAT
  ) ?? "";

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
      carryoverExpiryDate:
        formData.canCarryOver && formData.carryoverExpiryDate !== ""
          ? formData.carryoverExpiryDate
          : undefined,
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
