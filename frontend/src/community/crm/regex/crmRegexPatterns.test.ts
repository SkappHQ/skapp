import {
  isContactNameValid,
  isDealNameValid,
  isValidCompanyWebsiteUrl,
  isValidCrmPhoneNumber
} from "./crmRegexPatterns";

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

describe("isValidCrmPhoneNumber", () => {
  it("should accept plain digit sequences within the 7-15 digit range", () => {
    expect(isValidCrmPhoneNumber().test("0123456")).toBe(true);
    expect(isValidCrmPhoneNumber().test("012345678901234")).toBe(true);
    expect(isValidCrmPhoneNumber().test("012345")).toBe(false);
    expect(isValidCrmPhoneNumber().test("0123456789012345")).toBe(false);
  });

  it("should accept an optional leading + followed only by digits", () => {
    expect(isValidCrmPhoneNumber().test("+94771234567")).toBe(true);
    expect(isValidCrmPhoneNumber().test("94771234567")).toBe(true);
  });

  it("should reject spaces, hyphens, parentheses, letters, and a + that isn't the leading character", () => {
    expect(isValidCrmPhoneNumber().test("(071)2345678")).toBe(false);
    expect(isValidCrmPhoneNumber().test("071 234 5678")).toBe(false);
    expect(isValidCrmPhoneNumber().test("071-234-5678")).toBe(false);
    expect(isValidCrmPhoneNumber().test("(+94)719696108")).toBe(false);
    expect(isValidCrmPhoneNumber().test("94 071 + 96-96 (108)")).toBe(false);
    expect(isValidCrmPhoneNumber().test("++94712345678")).toBe(false);
    expect(isValidCrmPhoneNumber().test("abc1234567")).toBe(false);
  });
});

describe("isValidCompanyWebsiteUrl", () => {
  it("should accept a domain, an https URL, and an https URL with a path", () => {
    expect(isValidCompanyWebsiteUrl().test("acme.com")).toBe(true);
    expect(isValidCompanyWebsiteUrl().test("https://acme.com")).toBe(true);
    expect(isValidCompanyWebsiteUrl().test("https://acme.com/about-us")).toBe(
      true
    );
  });

  it("should reject insecure schemes, ports, query strings and fragments", () => {
    expect(isValidCompanyWebsiteUrl().test("http://acme.com")).toBe(false);
    expect(isValidCompanyWebsiteUrl().test("acme.com:8080")).toBe(false);
    expect(isValidCompanyWebsiteUrl().test("https://acme.com?ref=1")).toBe(
      false
    );
  });
});
