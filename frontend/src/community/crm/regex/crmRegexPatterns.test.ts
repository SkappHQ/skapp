import {
  isContactNameValid,
  isDealNameValid,
  isDealStageNameValid,
  isValidCompanyWebsiteUrl
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

describe("isDealStageNameValid", () => {
  it("should accept letters, numbers, spaces, hyphens, periods and apostrophes", () => {
    expect(isDealStageNameValid().test("Negotiation")).toBe(true);
    expect(isDealStageNameValid().test("Stage 2")).toBe(true);
    expect(isDealStageNameValid().test("Won't-Close v2.1")).toBe(true);
  });

  it("should reject numeric-only input", () => {
    expect(isDealStageNameValid().test("12345")).toBe(false);
  });

  it("should reject disallowed special characters", () => {
    expect(isDealStageNameValid().test("Won & Lost")).toBe(false);
    expect(isDealStageNameValid().test("Stage, 2")).toBe(false);
    expect(isDealStageNameValid().test("Bad<Name>")).toBe(false);
  });

  it("should reject emoji", () => {
    expect(isDealStageNameValid().test("Closed 😀")).toBe(false);
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
