import { formatToFiveDecimalPlaces } from "../numberUtils";

describe("formatToFiveDecimalPlaces", () => {
  it("should format a number to five decimal places", () => {
    expect(formatToFiveDecimalPlaces(123.456789)).toBe("123.45679");
  });

  it("should handle numbers with less than five decimal places", () => {
    expect(formatToFiveDecimalPlaces(123.4)).toBe("123.4");
  });

  it("should handle whole numbers", () => {
    expect(formatToFiveDecimalPlaces(123)).toBe("123");
  });

  it("should handle negative numbers", () => {
    expect(formatToFiveDecimalPlaces(-123.456789)).toBe("-123.45679");
  });

  it("should handle zero", () => {
    expect(formatToFiveDecimalPlaces(0)).toBe("0");
  });
});
