import { emailDomainPattern } from "~community/common/regex/regexPatterns";

type NumericValue = string | number | null;

export const formatMonetaryValue = (value: NumericValue) => {
  if (value == null || value == 0) return "-";
  return `$${value.toString().split(".")[0]}`;
};

export const extractDomainFromEmail = (email: string): string => {
  const match = emailDomainPattern().exec(email.trim());
  return match ? match[1].toLowerCase() : "";
};
