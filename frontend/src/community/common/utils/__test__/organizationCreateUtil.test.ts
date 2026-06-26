import { getPasswordStrength } from "../organizationCreateUtil";

describe("getPasswordStrength", () => {
  it("should return true for lowercase letters", () => {
    const result = getPasswordStrength("abc");
    expect(result[0]).toBe(true);
  });

  it("should return false for passwords shorter than 8 characters", () => {
    const result = getPasswordStrength("abc");
    expect(result[1]).toBe(false);
  });

  it("should return true for passwords with at least 8 characters", () => {
    const result = getPasswordStrength("abcdefgh");
    expect(result[1]).toBe(true);
  });

  it("should return true for uppercase letters", () => {
    const result = getPasswordStrength("Abc");
    expect(result[2]).toBe(true);
  });

  it("should return true for special characters", () => {
    const result = getPasswordStrength("abc@");
    expect(result[3]).toBe(true);
  });

  it("should return true for numeric characters", () => {
    const result = getPasswordStrength("abc1");
    expect(result[4]).toBe(true);
  });

  it("should return false for missing criteria", () => {
    const result = getPasswordStrength("abcdefg");
    expect(result[2]).toBe(false); // No uppercase
    expect(result[3]).toBe(false); // No special character
    expect(result[4]).toBe(false); // No digit
  });
});
