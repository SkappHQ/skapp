import { isContactNameValid } from "./crmRegexPatterns";

describe("isContactNameValid", () => {
  it("should accept letters, spaces, hyphens, periods, commas and apostrophes", () => {
    expect(isContactNameValid().test("Jane Smith")).toBe(true);
    expect(isContactNameValid().test("O'Brien, Jane")).toBe(true);
    expect(isContactNameValid().test("Anne-Marie St. Clair")).toBe(true);
    expect(isContactNameValid().test("José Müller")).toBe(true);
  });

  it("should reject names containing numbers", () => {
    expect(isContactNameValid().test("Jane Smith 123")).toBe(false);
    expect(isContactNameValid().test("12345")).toBe(false);
  });

  it("should reject names containing special characters", () => {
    expect(isContactNameValid().test("Jane@Smith!")).toBe(false);
    expect(isContactNameValid().test("Jane#Smith")).toBe(false);
  });
});
