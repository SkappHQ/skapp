type NumericValue = string | number | null;

export const formatMonetaryValue = (value: NumericValue) => {
  if (value == null || value == 0) return "-";
  return `$${value.toString().split(".")[0]}`;
};

export const extractDomainFromEmail = (email: string): string => {
  const parts = email.trim().split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : "";
};
