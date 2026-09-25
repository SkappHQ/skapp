import { isContactNameValid, isDealNameValid } from "./crmRegexPatterns";

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

describe("isDealNameValid", () => {
  it("should accept letters, numbers and allowed punctuation", () => {
    expect(isDealNameValid().test("Q3 Renewal - ACME & Co. (2026)")).toBe(true);
    expect(isDealNameValid().test("Deal #42 @HQ | Phase 1/2")).toBe(true);
  });

  it("should reject disallowed special characters", () => {
    expect(isDealNameValid().test("Deal <script>")).toBe(false);
    expect(isDealNameValid().test("Deal!")).toBe(false);
  });
});
