import {
  validatePersonalDetailsStep,
  validateEmergencyDetailsStep,
  isValidWorkEmail,
  getFirstInvalidStep
} from "./stepValidationUtils";

describe("stepValidationUtils", () => {
  describe("validatePersonalDetailsStep", () => {
    it("should return valid when all required fields are provided", () => {
      const result = validatePersonalDetailsStep(
        "John",
        "Doe",
        "Male",
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.invalidFields).toEqual([]);
    });

    it("should return invalid when firstName is missing", () => {
      const result = validatePersonalDetailsStep(
        null,
        "Doe",
        "Male",
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("firstName");
    });

    it("should return invalid when firstName is empty string", () => {
      const result = validatePersonalDetailsStep(
        "",
        "Doe",
        "Male",
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("firstName");
    });

    it("should return invalid when firstName is whitespace only", () => {
      const result = validatePersonalDetailsStep(
        "   ",
        "Doe",
        "Male",
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("firstName");
    });

    it("should return invalid when lastName is undefined", () => {
      const result = validatePersonalDetailsStep(
        "John",
        undefined,
        "Male",
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("lastName");
    });

    it("should return invalid when gender is null", () => {
      const result = validatePersonalDetailsStep(
        "John",
        "Doe",
        null,
        "1990-01-01",
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("gender");
    });

    it("should return invalid when birthDate is null", () => {
      const result = validatePersonalDetailsStep(
        "John",
        "Doe",
        "Male",
        null,
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("birthDate");
    });

    it("should return invalid when nationality is null", () => {
      const result = validatePersonalDetailsStep(
        "John",
        "Doe",
        "Male",
        "1990-01-01",
        null
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("nationality");
    });

    it("should return all invalid fields when all are missing", () => {
      const result = validatePersonalDetailsStep(
        null,
        null,
        null,
        null,
        null
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toEqual([
        "firstName",
        "lastName",
        "gender",
        "birthDate",
        "nationality"
      ]);
      expect(result.errorMessage).toBe(
        "Missing required fields: firstName, lastName, gender, birthDate, nationality"
      );
    });

    it("should return multiple invalid fields when some are missing", () => {
      const result = validatePersonalDetailsStep(
        "John",
        null,
        "Male",
        null,
        "US"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toEqual(["lastName", "birthDate"]);
    });
  });

  describe("validateEmergencyDetailsStep", () => {
    it("should return valid when all required fields are provided", () => {
      const result = validateEmergencyDetailsStep(
        "Jane Doe",
        "Spouse",
        "+1234567890"
      );
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
      expect(result.invalidFields).toEqual([]);
    });

    it("should return invalid when contactName is null", () => {
      const result = validateEmergencyDetailsStep(
        null,
        "Spouse",
        "+1234567890"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("contactName");
    });

    it("should return invalid when contactName is whitespace only", () => {
      const result = validateEmergencyDetailsStep(
        "   ",
        "Spouse",
        "+1234567890"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("contactName");
    });

    it("should return invalid when relationship is null", () => {
      const result = validateEmergencyDetailsStep(
        "Jane Doe",
        null,
        "+1234567890"
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("relationship");
    });

    it("should return invalid when contactPhone is undefined", () => {
      const result = validateEmergencyDetailsStep(
        "Jane Doe",
        "Spouse",
        undefined
      );
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain("contactPhone");
    });

    it("should return all invalid fields when all are missing", () => {
      const result = validateEmergencyDetailsStep(null, null, null);
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toEqual([
        "contactName",
        "relationship",
        "contactPhone"
      ]);
      expect(result.errorMessage).toBe(
        "Missing required emergency contact fields: contactName, relationship, contactPhone"
      );
    });
  });

  describe("isValidWorkEmail", () => {
    it("should return true for valid email", () => {
      expect(isValidWorkEmail("john@company.com")).toBe(true);
    });

    it("should return true for email with subdomain", () => {
      expect(isValidWorkEmail("john@mail.company.com")).toBe(true);
    });

    it("should return true for email with plus addressing", () => {
      expect(isValidWorkEmail("john+work@company.com")).toBe(true);
    });

    it("should return false for null", () => {
      expect(isValidWorkEmail(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isValidWorkEmail(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidWorkEmail("")).toBe(false);
    });

    it("should return false for email without @", () => {
      expect(isValidWorkEmail("johncompany.com")).toBe(false);
    });

    it("should return false for email without domain", () => {
      expect(isValidWorkEmail("john@")).toBe(false);
    });

    it("should return false for email with spaces", () => {
      expect(isValidWorkEmail("john @company.com")).toBe(false);
    });

    it("should return true for email with leading/trailing spaces (trimmed)", () => {
      expect(isValidWorkEmail("  john@company.com  ")).toBe(true);
    });
  });

  describe("getFirstInvalidStep", () => {
    it("should return null when all steps are valid", () => {
      expect(getFirstInvalidStep(true, true, true)).toBeNull();
    });

    it("should return 0 when personal details is invalid", () => {
      expect(getFirstInvalidStep(false, true, true)).toBe(0);
    });

    it("should return 1 when emergency details is invalid", () => {
      expect(getFirstInvalidStep(true, false, true)).toBe(1);
    });

    it("should return 2 when employment details is invalid", () => {
      expect(getFirstInvalidStep(true, true, false)).toBe(2);
    });

    it("should return 0 when all steps are invalid (first invalid wins)", () => {
      expect(getFirstInvalidStep(false, false, false)).toBe(0);
    });

    it("should return 1 when emergency and employment are invalid", () => {
      expect(getFirstInvalidStep(true, false, false)).toBe(1);
    });
  });
});
