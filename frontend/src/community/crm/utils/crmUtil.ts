type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${Number.parseFloat(value).toFixed(2)}`;
};

export const toUtcDateTimeString = (isoDate: string | null): string | null => {
  if (!isoDate) return null;
  return new Date(isoDate).toISOString().slice(0, -1);
};
