import {
  CURRENCY_PREFIX,
  EMPTY_PLACEHOLDER
} from "~community/crm/v2/constants/commonConstants";

const isEmptyValue = (value?: string | number) =>
  value === undefined || Number(value) === 0;

export const formatTableValue = (value?: string | number, prefix = "") =>
  isEmptyValue(value) ? EMPTY_PLACEHOLDER : `${prefix}${value}`;

export const formatMonetaryValue = (value?: string) =>
  formatTableValue(value?.split(".")[0], CURRENCY_PREFIX);

export const formatMonetaryValueWithDecimals = (value?: string | number) =>
  isEmptyValue(value)
    ? EMPTY_PLACEHOLDER
    : `${CURRENCY_PREFIX}${Number(value).toFixed(2)}`;
