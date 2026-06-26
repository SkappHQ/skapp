import {
  confirmPasswordValidation,
  emailValidation,
  passwordValidation
} from "../validationUtils";

describe("validationUtils", () => {
  const mockTranslateText = (key: string[]) => key[0];

  describe("emailValidation", () => {
    it("should validate a correct email", async () => {
      const schema = emailValidation(mockTranslateText);
      await expect(schema.validate("test@example.com")).resolves.toBe(
        "test@example.com"
      );
    });

    it("should throw an error for an invalid email", async () => {
      const schema = emailValidation(mockTranslateText);
      await expect(schema.validate("invalid-email")).rejects.toThrow(
        "emailValidError"
      );
    });

    it("should throw an error for a missing email", async () => {
      const schema = emailValidation(mockTranslateText);
      await expect(schema.validate("")).rejects.toThrow("emailValidError");
    });
  });

  describe("passwordValidation", () => {
    it("should validate a strong password", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("StrongP@ssw0rd")).resolves.toBe(
        "StrongP@ssw0rd"
      );
    });

    it("should throw an error for a password without a lowercase letter", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("PASSWORD123!")).rejects.toThrow(
        "passwordLowercaseError"
      );
    });

    it("should throw an error for a password without an uppercase letter", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("password123!")).rejects.toThrow(
        "passwordUppercaseError"
      );
    });

    it("should throw an error for a password without a number", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("Password!")).rejects.toThrow(
        "passwordNumberError"
      );
    });

    it("should throw an error for a password without a special character", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("Password123")).rejects.toThrow(
        "passwordSpecialCharError"
      );
    });

    it("should throw an error for a password shorter than 8 characters", async () => {
      const schema = passwordValidation(mockTranslateText);
      await expect(schema.validate("P@ss1")).rejects.toThrow(
        "passwordMinLengthError"
      );
    });
  });

  describe("confirmPasswordValidation", () => {
    it("should throw an error for non-matching passwords", async () => {
      const schema = confirmPasswordValidation(
        mockTranslateText,
        "Password123!"
      );
      await expect(schema.validate("DifferentPassword")).rejects.toThrow(
        "passwordMatchError"
      );
    });

    it("should throw an error for a missing confirm password", async () => {
      const schema = confirmPasswordValidation(
        mockTranslateText,
        "Password123!"
      );
      await expect(schema.validate("")).rejects.toThrow("passwordMatchError");
    });
  });
});
