type NumericValue = string | number | null;

export const formatValue = (value: NumericValue) => {
  if (value == null || value == 0) return "-";
  return  `$${value.toString().split('.')[0]}`
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
