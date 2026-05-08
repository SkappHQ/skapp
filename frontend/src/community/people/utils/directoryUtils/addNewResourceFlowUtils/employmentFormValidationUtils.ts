import { DateTime } from "luxon";

interface EmploymentDateValidation {
  joinedDate: string | null;
  probationEndDate?: string | null;
  contractEndDate?: string | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates that probation end date is after joined date
 */
export const validateProbationEndDate = (
  joinedDate: string | null,
  probationEndDate: string | null
): string | null => {
  if (!probationEndDate || !joinedDate) return null;

  const joined = DateTime.fromISO(joinedDate);
  const probEnd = DateTime.fromISO(probationEndDate);

  if (!joined.isValid || !probEnd.isValid) {
    return "Invalid date format";
  }

  if (probEnd <= joined) {
    return "Probation end date must be after joined date";
  }

  return null;
};

/**
 * Validates that contract end date is after joined date
 */
export const validateContractEndDate = (
  joinedDate: string | null,
  contractEndDate: string | null
): string | null => {
  if (!contractEndDate || !joinedDate) return null;

  const joined = DateTime.fromISO(joinedDate);
  const contractEnd = DateTime.fromISO(contractEndDate);

  if (!joined.isValid || !contractEnd.isValid) {
    return "Invalid date format";
  }

  if (contractEnd <= joined) {
    return "Contract end date must be after joined date";
  }

  return null;
};

/**
 * Validates all employment dates for the add new resource flow
 */
export const validateEmploymentDates = (
  dates: EmploymentDateValidation
): ValidationResult => {
  const errors: Record<string, string> = {};

  const probationError = validateProbationEndDate(
    dates.joinedDate,
    dates.probationEndDate ?? null
  );
  if (probationError) {
    errors.probationEndDate = probationError;
  }

  const contractError = validateContractEndDate(
    dates.joinedDate,
    dates.contractEndDate ?? null
  );
  if (contractError) {
    errors.contractEndDate = contractError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculates the probation period in months between joined date and probation end date
 */
export const calculateProbationMonths = (
  joinedDate: string | null,
  probationEndDate: string | null
): number | null => {
  if (!joinedDate || !probationEndDate) return null;

  const joined = DateTime.fromISO(joinedDate);
  const probEnd = DateTime.fromISO(probationEndDate);

  if (!joined.isValid || !probEnd.isValid) return null;

  const diff = probEnd.diff(joined, "months");
  return Math.round(diff.months);
};

/**
 * Generates an employee number suggestion based on existing count
 */
export const generateEmployeeNumberSuggestion = (
  existingCount: number,
  prefix: string = "EMP"
): string => {
  const nextNumber = existingCount + 1;
  const paddedNumber = nextNumber.toString().padStart(4, "0");
  return `${prefix}-${paddedNumber}`;
};
