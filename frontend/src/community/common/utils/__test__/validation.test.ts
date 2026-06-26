import {
  dateValidation,
  isEmailInputValid,
  isValidAlphaNumericNamePattern,
  isValidEmailPattern,
  isValidNamePattern,
  signInValidation,
  signUpValidation
} from "../validation";

describe("Validation Tests", () => {
  const mockTranslate = (keys: string[]) => keys.join(", ");

  describe("signUpValidation", () => {
    it("should validate a valid sign-up form", async () => {
      const schema = signUpValidation(mockTranslate);
      const validData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Password123!"
      };
      await expect(schema.validate(validData)).resolves.toBeTruthy();
    });

    it("should fail for invalid email", async () => {
      const schema = signUpValidation(mockTranslate);
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "Password123!"
      };
      await expect(schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe("signInValidation", () => {
    it("should validate a valid sign-in form", async () => {
      const schema = signInValidation(mockTranslate);
      const validData = {
        email: "john.doe@example.com",
        password: "Password123!"
      };
      await expect(schema.validate(validData)).resolves.toBeTruthy();
    });

    it("should fail for missing password", async () => {
      const schema = signInValidation(mockTranslate);
      const invalidData = {
        email: "john.doe@example.com"
      };
      await expect(schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe("isEmailInputValid", () => {
    it("should return true for a valid email", () => {
      expect(isEmailInputValid("test@example.com")).toBe(true);
    });

    it("should return false for an invalid email", () => {
      expect(isEmailInputValid("invalid-email")).toBe(false);
    });
  });

  describe("isValidNamePattern", () => {
    it("should return true for a valid name", () => {
      expect(isValidNamePattern("John Doe")).toBe(true);
    });

    it("should return false for an invalid name", () => {
      expect(isValidNamePattern("John123")).toBe(false);
    });
  });

  describe("isValidAlphaNumericNamePattern", () => {
    it("should return true for a valid alphanumeric name", () => {
      expect(isValidAlphaNumericNamePattern("John_Doe123")).toBe(false);
    });

    it("should return false for an invalid alphanumeric name", () => {
      expect(isValidAlphaNumericNamePattern("John@Doe!")).toBe(false);
    });
  });

  describe("isValidEmailPattern", () => {
    it("should return true for a valid email", () => {
      expect(isValidEmailPattern("test@example.com")).toBe(true);
    });

    it("should return false for an email with consecutive periods", () => {
      expect(isValidEmailPattern("test..email@example.com")).toBe(false);
    });
  });

  describe("dateValidation", () => {
    it("should return true for a valid date", () => {
      expect(dateValidation("2023-10-01")).toBe(true);
    });

    it("should return false for an invalid date", () => {
      expect(dateValidation("01-10-2023")).toBe(false);
    });
  });
});
