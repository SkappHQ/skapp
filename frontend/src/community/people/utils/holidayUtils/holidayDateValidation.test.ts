import { normalizeDate } from "./holidayDateValidation";

describe("normalizeDate", () => {
  it("should normalize a valid date in YYYY/MM/DD format", () => {
    const inputDate = "2023/10/15";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-10-15");
  });

  it("should normalize a valid date in YYYY-MM-DD format", () => {
    const inputDate = "2023-10-15";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-10-15");
  });

  it("should normalize a valid date in MM/DD/YYYY format", () => {
    const inputDate = "10/15/2023";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-10-15");
  });

  it("should normalize a valid date in DD/MM/YYYY format", () => {
    const inputDate = "15/10/2023";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-10-15");
  });

  it("should normalize a valid date in M/D/YYYY format", () => {
    const inputDate = "1/5/2023";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-01-05");
  });

  it("should return null for an invalid date format", () => {
    const inputDate = "2023.10.15";
    const result = normalizeDate(inputDate);
    expect(result).toBeNull();
  });

  it("should return null for an invalid date", () => {
    const inputDate = "2023/02/30";
    const result = normalizeDate(inputDate);
    expect(result).toBeNull();
  });

  it("should normalize a valid date in YYYY/DD/MM format", () => {
    const inputDate = "2023/15/10";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-10-15");
  });

  it("should normalize a valid date in YYYY-M-D format", () => {
    const inputDate = "2023-1-5";
    const result = normalizeDate(inputDate);
    expect(result).toBe("2023-01-05");
  });
});
