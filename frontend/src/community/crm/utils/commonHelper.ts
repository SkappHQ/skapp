import { emailDomainPattern } from "~community/common/regex/regexPatterns";

export const extractDomain = (input: string): string => {
  const match = new RegExp(emailDomainPattern()).exec(input.trim());
  return match ? match[1].toLowerCase() : "";
};
