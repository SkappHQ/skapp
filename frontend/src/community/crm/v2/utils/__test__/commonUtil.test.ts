import {
  formatMonetaryValue,
  formatMonetaryValueWithDecimals,
  formatTableValue
} from "../commonUtil";

describe("formatTableValue", () => {
  it("returns the placeholder when the value is missing", () => {
    expect(formatTableValue(undefined)).toBe("-");
  });

  it("returns the placeholder when the value is zero", () => {
    expect(formatTableValue(0)).toBe("-");
  });

  it("returns the value as-is when present", () => {
    expect(formatTableValue(23)).toBe("23");
  });

  it("applies the given prefix", () => {
    expect(formatTableValue("94771234567", "+")).toBe("+94771234567");
  });

  it("does not prefix a missing value", () => {
    expect(formatTableValue(undefined, "+")).toBe("-");
  });
});

describe("formatMonetaryValue", () => {
  it("drops the decimal part", () => {
    expect(formatMonetaryValue("14700000.00")).toBe("$14700000");
  });

  it("returns the placeholder when the value is missing", () => {
    expect(formatMonetaryValue(undefined)).toBe("-");
  });

  it("returns the placeholder when the amount is zero", () => {
    expect(formatMonetaryValue("0.00")).toBe("-");
  });

  it("renders an amount under one as zero, not as missing data", () => {
    expect(formatMonetaryValue("0.50")).toBe("$0");
  });
});

describe("formatMonetaryValueWithDecimals", () => {
  it("keeps two decimal places", () => {
    expect(formatMonetaryValueWithDecimals("5000000.00")).toBe("$5000000.00");
  });

  it("returns the placeholder when the value is missing", () => {
    expect(formatMonetaryValueWithDecimals(undefined)).toBe("-");
  });

  it("returns the placeholder when the amount is zero", () => {
    expect(formatMonetaryValueWithDecimals("0.00")).toBe("-");
  });
});
