type NumericValue = string | null;

export const formatValue = (value: NumericValue): string => {
  if (value == null || value === "") return "-";
  return `$${value.toString().split(".")[0]}`;
};

export const getFullName = (
  firstName: string,
  lastName: string | null | undefined
): string => `${firstName} ${lastName ?? ""}`.trim();



