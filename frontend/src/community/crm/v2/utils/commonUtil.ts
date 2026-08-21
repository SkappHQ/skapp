import {
  CURRENCY_PREFIX,
  EMPTY_PLACEHOLDER
} from "~community/crm/v2/constants/commonConstants";

const isEmptyValue = (value?: string | number) =>
  value === undefined || Number(value) === 0;

export const formatTableValue = (value?: string | number, prefix = "") =>
  isEmptyValue(value) ? EMPTY_PLACEHOLDER : `${prefix}${value}`;

export const formatMonetaryValue = (value?: string) => {
  if (isEmptyValue(value)) return EMPTY_PLACEHOLDER;

  return `${CURRENCY_PREFIX}${value?.split(".")[0]}`;
};

export const formatMonetaryValueWithDecimals = (value?: string | number) =>
  isEmptyValue(value)
    ? EMPTY_PLACEHOLDER
    : `${CURRENCY_PREFIX}${Number(value).toFixed(2)}`;
