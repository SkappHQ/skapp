type NumericValue = string | number | null;

export const formatCurrency = (value: NumericValue) => {
  if (value == null || value === 0) return "-";
  return  `$${value}`
};

export const formatPhoneNumber = (value: NumericValue) => {
  if (value == null) return "-";
  return `+${value}`;
};

export const formatTasks = (
  value: NumericValue
) => {
  if (value == null || value === 0) return "-";
  return (
    `${value}`
  );
};
