const isEmptyValue = (value?: string | number) =>
  value === undefined || Number(value) === 0;

export const formatTableValue = (value?: string | number, prefix = "") =>
  isEmptyValue(value) ? "-" : `${prefix}${value}`;

export const formatMonetaryValue = (value?: string) => {
  if (isEmptyValue(value)) return "-";

  return `$${value?.split(".")[0]}`;
};

export const formatMonetaryValueWithDecimals = (value?: string | number) =>
  isEmptyValue(value) ? "-" : `$${Number(value).toFixed(2)}`;
