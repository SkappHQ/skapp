import {
  validateProbationEndDate,
  validateContractEndDate,
  validateEmploymentDates,
  calculateProbationMonths,
  generateEmployeeNumberSuggestion
} from "./employmentFormValidationUtils";

describe("employmentFormValidationUtils", () => {
  describe("validateProbationEndDate", () => {
    it("should return null when probationEndDate is null", () => {
      expect(validateProbationEndDate("2024-01-15", null)).toBeNull();
    });

    it("should return null when joinedDate is null", () => {
      expect(validateProbationEndDate(null, "2024-07-15")).toBeNull();
    });

    it("should return null when both dates are null", () => {
      expect(validateProbationEndDate(null, null)).toBeNull();
    });

    it("should return null when probation end date is after joined date", () => {
      expect(
        validateProbationEndDate("2024-01-15", "2024-07-15")
      ).toBeNull();
    });

    it("should return error when probation end date is before joined date", () => {
      expect(
        validateProbationEndDate("2024-07-15", "2024-01-15")
      ).toBe("Probation end date must be after joined date");
    });

    it("should return error when probation end date equals joined date", () => {
      expect(
        validateProbationEndDate("2024-01-15", "2024-01-15")
      ).toBe("Probation end date must be after joined date");
    });

    it("should return error when joinedDate is invalid format", () => {
      expect(
        validateProbationEndDate("not-a-date", "2024-07-15")
      ).toBe("Invalid date format");
    });

    it("should return error when probationEndDate is invalid format", () => {
      expect(
        validateProbationEndDate("2024-01-15", "not-a-date")
      ).toBe("Invalid date format");
    });
  });

  describe("validateContractEndDate", () => {
    it("should return null when contractEndDate is null", () => {
      expect(validateContractEndDate("2024-01-15", null)).toBeNull();
    });

    it("should return null when joinedDate is null", () => {
      expect(validateContractEndDate(null, "2024-12-31")).toBeNull();
    });

    it("should return null when both dates are null", () => {
      expect(validateContractEndDate(null, null)).toBeNull();
    });

    it("should return null when contract end date is after joined date", () => {
      expect(
        validateContractEndDate("2024-01-15", "2024-12-31")
      ).toBeNull();
    });

    it("should return error when contract end date is before joined date", () => {
      expect(
        validateContractEndDate("2024-07-15", "2024-01-15")
      ).toBe("Contract end date must be after joined date");
    });

    it("should return error when contract end date equals joined date", () => {
      expect(
        validateContractEndDate("2024-01-15", "2024-01-15")
      ).toBe("Contract end date must be after joined date");
    });

    it("should return error when joinedDate is invalid format", () => {
      expect(
        validateContractEndDate("invalid", "2024-12-31")
      ).toBe("Invalid date format");
    });

    it("should return error when contractEndDate is invalid format", () => {
      expect(
        validateContractEndDate("2024-01-15", "invalid")
      ).toBe("Invalid date format");
    });
  });

  describe("validateEmploymentDates", () => {
    it("should return isValid true when all dates are valid", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-01-15",
        probationEndDate: "2024-07-15",
        contractEndDate: "2025-01-15"
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return isValid true when optional dates are null", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-01-15",
        probationEndDate: null,
        contractEndDate: null
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return isValid true when optional dates are undefined", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-01-15"
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return isValid true when joinedDate is null and optional dates are null", () => {
      const result = validateEmploymentDates({
        joinedDate: null,
        probationEndDate: "2024-07-15",
        contractEndDate: "2025-01-15"
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return probationEndDate error when probation is before joined", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-07-15",
        probationEndDate: "2024-01-15",
        contractEndDate: "2025-01-15"
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.probationEndDate).toBe(
        "Probation end date must be after joined date"
      );
      expect(result.errors.contractEndDate).toBeUndefined();
    });

    it("should return contractEndDate error when contract is before joined", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-07-15",
        probationEndDate: "2024-12-15",
        contractEndDate: "2024-01-15"
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.contractEndDate).toBe(
        "Contract end date must be after joined date"
      );
      expect(result.errors.probationEndDate).toBeUndefined();
    });

    it("should return both errors when both dates are invalid", () => {
      const result = validateEmploymentDates({
        joinedDate: "2024-07-15",
        probationEndDate: "2024-01-15",
        contractEndDate: "2024-01-15"
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.probationEndDate).toBe(
        "Probation end date must be after joined date"
      );
      expect(result.errors.contractEndDate).toBe(
        "Contract end date must be after joined date"
      );
    });
  });

  describe("calculateProbationMonths", () => {
    it("should return null when joinedDate is null", () => {
      expect(calculateProbationMonths(null, "2024-07-15")).toBeNull();
    });

    it("should return null when probationEndDate is null", () => {
      expect(calculateProbationMonths("2024-01-15", null)).toBeNull();
    });

    it("should return null when both dates are null", () => {
      expect(calculateProbationMonths(null, null)).toBeNull();
    });

    it("should return null when joinedDate is invalid", () => {
      expect(calculateProbationMonths("invalid", "2024-07-15")).toBeNull();
    });

    it("should return null when probationEndDate is invalid", () => {
      expect(calculateProbationMonths("2024-01-15", "invalid")).toBeNull();
    });

    it("should calculate 6 months correctly", () => {
      expect(
        calculateProbationMonths("2024-01-15", "2024-07-15")
      ).toBe(6);
    });

    it("should calculate 3 months correctly", () => {
      expect(
        calculateProbationMonths("2024-01-01", "2024-04-01")
      ).toBe(3);
    });

    it("should calculate 12 months correctly", () => {
      expect(
        calculateProbationMonths("2024-01-01", "2025-01-01")
      ).toBe(12);
    });

    it("should return 0 when dates are the same", () => {
      expect(
        calculateProbationMonths("2024-01-15", "2024-01-15")
      ).toBe(0);
    });

    it("should handle negative difference (end before start)", () => {
      const result = calculateProbationMonths("2024-07-15", "2024-01-15");
      expect(result).toBe(-6);
    });
  });

  describe("generateEmployeeNumberSuggestion", () => {
    it("should generate EMP-0001 for count 0", () => {
      expect(generateEmployeeNumberSuggestion(0)).toBe("EMP-0001");
    });

    it("should generate EMP-0002 for count 1", () => {
      expect(generateEmployeeNumberSuggestion(1)).toBe("EMP-0002");
    });

    it("should generate EMP-0100 for count 99", () => {
      expect(generateEmployeeNumberSuggestion(99)).toBe("EMP-0100");
    });

    it("should generate EMP-1000 for count 999", () => {
      expect(generateEmployeeNumberSuggestion(999)).toBe("EMP-1000");
    });

    it("should generate EMP-10000 for count 9999", () => {
      expect(generateEmployeeNumberSuggestion(9999)).toBe("EMP-10000");
    });

    it("should use custom prefix when provided", () => {
      expect(generateEmployeeNumberSuggestion(0, "STAFF")).toBe(
        "STAFF-0001"
      );
    });

    it("should use custom prefix with large count", () => {
      expect(generateEmployeeNumberSuggestion(500, "ID")).toBe("ID-0501");
    });

    it("should use default prefix EMP when prefix not provided", () => {
      expect(generateEmployeeNumberSuggestion(5)).toBe("EMP-0006");
    });
  });
});
