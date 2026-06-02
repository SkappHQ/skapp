type NumericValue = string | number | null;

export const formatMonetaryValue = (value: NumericValue) => {
  if (value == null || value == 0) return "-";
  return  `$${value.toString().split('.')[0]}`
};