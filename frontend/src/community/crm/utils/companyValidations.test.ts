import { isValidCompanyWebsiteUrl } from "~community/crm/utils/companyValidations";

describe("isValidCompanyWebsiteUrl()", () => {
  const regex = isValidCompanyWebsiteUrl();

  it("accepts a bare domain (no scheme)", () => {
    expect(regex.test("example.com")).toBe(true);
    expect(regex.test("www.example.com")).toBe(true);
    expect(regex.test("sub.example.co.uk")).toBe(true);
  });

  it("accepts an https URL", () => {
    expect(regex.test("https://example.com")).toBe(true);
    expect(regex.test("https://www.example.com")).toBe(true);
    expect(regex.test("https://sub.example.co.uk")).toBe(true);
  });

  it("accepts an https URL with a path", () => {
    expect(regex.test("https://example.com/about-us")).toBe(true);
    expect(regex.test("example.com/about-us")).toBe(true);
    expect(regex.test("https://example.com/")).toBe(true);
  });

  it("rejects insecure or other schemes", () => {
    expect(regex.test("http://example.com")).toBe(false);
    expect(regex.test("ftp://example.com")).toBe(false);
    expect(regex.test("http://example.com/about-us")).toBe(false);
  });

  it("rejects port numbers", () => {
    expect(regex.test("https://example.com:8080")).toBe(false);
    expect(regex.test("example.com:8080")).toBe(false);
    expect(regex.test("example.com:8080/api/v1/users")).toBe(false);
  });

  it("rejects query strings and fragments", () => {
    expect(regex.test("https://example.com?ref=1")).toBe(false);
    expect(regex.test("https://example.com#section")).toBe(false);
    expect(regex.test("https://example.com/about-us?ref=1")).toBe(false);
    expect(regex.test("https://example.com/about-us#section")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(regex.test("example")).toBe(false);
    expect(regex.test("https://.com")).toBe(false);
    expect(regex.test("http://example..com")).toBe(false);
  });

  it("does not exhibit super-linear backtracking on adversarial input", () => {
    const input = "https://" + "a".repeat(10000) + "!";
    const start = process.hrtime.bigint();
    regex.test(input);
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    expect(ms).toBeLessThan(100);
  });
});
