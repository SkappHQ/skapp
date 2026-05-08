/**
 * Utility functions for validating the add new resource form steps
 * before allowing the user to proceed to the next step.
 */

interface StepValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  invalidFields: string[];
}

/**
 * Validates that all required personal details fields are filled
 */
export const validatePersonalDetailsStep = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  gender: string | null | undefined,
  birthDate: string | null | undefined,
  nationality: string | null | undefined
): StepValidationResult => {
  const invalidFields: string[] = [];

  if (!firstName?.trim()) invalidFields.push("firstName");
  if (!lastName?.trim()) invalidFields.push("lastName");
  if (!gender) invalidFields.push("gender");
  if (!birthDate) invalidFields.push("birthDate");
  if (!nationality) invalidFields.push("nationality");

  return {
    isValid: invalidFields.length === 0,
    errorMessage:
      invalidFields.length > 0
        ? `Missing required fields: ${invalidFields.join(", ")}`
        : null,
    invalidFields
  };
};

/**
 * Validates that emergency contact required fields are filled
 */
export const validateEmergencyDetailsStep = (
  contactName: string | null | undefined,
  relationship: string | null | undefined,
  contactPhone: string | null | undefined
): StepValidationResult => {
  const invalidFields: string[] = [];

  if (!contactName?.trim()) invalidFields.push("contactName");
  if (!relationship?.trim()) invalidFields.push("relationship");
  if (!contactPhone?.trim()) invalidFields.push("contactPhone");

  return {
    isValid: invalidFields.length === 0,
    errorMessage:
      invalidFields.length > 0
        ? `Missing required emergency contact fields: ${invalidFields.join(", ")}`
        : null,
    invalidFields
  };
};

/**
 * Validates work email format
 */
export const isValidWorkEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Returns the step index that has the first validation error,
 * or null if all steps are valid
 */
export const getFirstInvalidStep = (
  personalValid: boolean,
  emergencyValid: boolean,
  employmentValid: boolean
): number | null => {
  if (!personalValid) return 0;
  if (!emergencyValid) return 1;
  if (!employmentValid) return 2;
  return null;
};
