type NumericValue = string | number | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(String(value)).toFixed(2)}`;
};
