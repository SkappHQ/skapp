import {
  appendId,
  formatMonetaryValue,
  formatMonetaryValueWithDecimals,
  formatTableValue
} from "../commonUtil";

describe("formatTableValue", () => {
  it("shows a placeholder for missing and zero values", () => {
    expect(formatTableValue(undefined)).toBe("-");
    expect(formatTableValue(0)).toBe("-");
  });

  it("applies the prefix to a real value", () => {
    expect(formatTableValue("771234567", "+")).toBe("+771234567");
  });

  it("does not prefix the placeholder", () => {
    expect(formatTableValue(undefined, "+")).toBe("-");
  });
});

describe("formatMonetaryValue", () => {
  it("drops the decimal part", () => {
    expect(formatMonetaryValue("14700000.00")).toBe("$14700000");
  });

  it("keeps sub-unit amounts visible rather than treating them as empty", () => {
    expect(formatMonetaryValue("0.50")).toBe("$0");
  });

  it("shows a placeholder for missing and zero values", () => {
    expect(formatMonetaryValue(undefined)).toBe("-");
    expect(formatMonetaryValue("0.00")).toBe("-");
  });

  it("shows a placeholder for a non numeric value", () => {
    expect(formatMonetaryValue("abc")).toBe("-");
  });
});

describe("formatMonetaryValueWithDecimals", () => {
  it("keeps two decimal places", () => {
    expect(formatMonetaryValueWithDecimals("5000000.00")).toBe("$5000000.00");
  });

  it("shows a placeholder for missing and zero values", () => {
    expect(formatMonetaryValueWithDecimals(undefined)).toBe("-");
    expect(formatMonetaryValueWithDecimals("0.00")).toBe("-");
  });

  it("shows a placeholder for a non numeric value", () => {
    expect(formatMonetaryValueWithDecimals("abc")).toBe("-");
  });
});

describe("appendId", () => {
  it("starts a new list when there is none", () => {
    expect(appendId(undefined, 1)).toEqual([1]);
  });

  it("does not append an id that is already there", () => {
    const ids = [1, 2];
    expect(appendId(ids, 2)).toBe(ids);
  });

  it("does not mutate the original list", () => {
    const ids = [1];
    appendId(ids, 2);
    expect(ids).toEqual([1]);
  });
});
