import { DateTime, Settings } from "luxon";

import {
  calculateTenure,
  formatTenureLabel,
  getTenureInMonths
} from "./careerProgressUtils";

describe("calculateTenure", () => {
  beforeAll(() => {
    Settings.now = () => new Date(2025, 0, 1).valueOf();
  });

  afterAll(() => {
    Settings.now = () => Date.now();
  });

  it("should return years and months when tenure is over a year", () => {
    const result = calculateTenure({
      startDate: "2023-01-01",
      endDate: "2024-06-15"
    });
    expect(result).toBe("1y 5m");
  });

  it("should return only months when tenure is less than a year", () => {
    const result = calculateTenure({
      startDate: "2024-03-01",
      endDate: "2024-08-01"
    });
    expect(result).toBe("5m");
  });

  it("should return 0m when start and end are the same date", () => {
    const result = calculateTenure({
      startDate: "2024-06-01",
      endDate: "2024-06-01"
    });
    expect(result).toBe("0m");
  });

  it("should use current date when currentPosition is true", () => {
    const result = calculateTenure({
      startDate: "2024-01-01",
      currentPosition: true
    });
    expect(result).toBe("1y 0m");
  });

  it("should handle multi-year tenure", () => {
    const result = calculateTenure({
      startDate: "2020-03-15",
      endDate: "2024-09-20"
    });
    expect(result).toBe("4y 6m");
  });

  it("should clamp negative values to 0 when end is before start", () => {
    const result = calculateTenure({
      startDate: "2024-06-01",
      endDate: "2024-01-01"
    });
    expect(result).toBe("0m");
  });

  it("should handle missing endDate when not currentPosition by using empty string", () => {
    const result = calculateTenure({
      startDate: "2024-01-01"
    });
    expect(result).toMatch(/m$/);
  });
});

describe("formatTenureLabel", () => {
  const translateText = (keys: string[]): string => keys[0];

  it("should return less_than_a_month when years and months are both 0", () => {
    const result = formatTenureLabel(0, 0, translateText);
    expect(result).toBe("less_than_a_month");
  });

  it("should return singular year label for 1 year 0 months", () => {
    const result = formatTenureLabel(1, 0, translateText);
    expect(result).toBe("1 year");
  });

  it("should return plural years label for multiple years", () => {
    const result = formatTenureLabel(3, 0, translateText);
    expect(result).toBe("3 years");
  });

  it("should return singular month label for 1 month", () => {
    const result = formatTenureLabel(0, 1, translateText);
    expect(result).toBe("1 month");
  });

  it("should return plural months label for multiple months", () => {
    const result = formatTenureLabel(0, 5, translateText);
    expect(result).toBe("5 months");
  });

  it("should return years and months combined", () => {
    const result = formatTenureLabel(2, 3, translateText);
    expect(result).toBe("2 years, 3 months");
  });

  it("should return 1 year, 1 month with singular labels", () => {
    const result = formatTenureLabel(1, 1, translateText);
    expect(result).toBe("1 year, 1 month");
  });

  it("should floor fractional years and months", () => {
    const result = formatTenureLabel(2.9, 4.7, translateText);
    expect(result).toBe("2 years, 4 months");
  });

  it("should clamp negative years to 0", () => {
    const result = formatTenureLabel(-3, 5, translateText);
    expect(result).toBe("5 months");
  });

  it("should clamp negative months to 0", () => {
    const result = formatTenureLabel(2, -1, translateText);
    expect(result).toBe("2 years");
  });

  it("should clamp months to max 11", () => {
    const result = formatTenureLabel(1, 15, translateText);
    expect(result).toBe("1 year, 11 months");
  });

  it("should return less_than_a_month when both values are negative", () => {
    const result = formatTenureLabel(-1, -2, translateText);
    expect(result).toBe("less_than_a_month");
  });
});

describe("getTenureInMonths", () => {
  beforeAll(() => {
    Settings.now = () => new Date(2025, 0, 1).valueOf();
  });

  afterAll(() => {
    Settings.now = () => Date.now();
  });

  it("should return correct months between two dates", () => {
    const result = getTenureInMonths("2024-01-01", "2024-07-01");
    expect(result).toBe(6);
  });

  it("should return 0 for same start and end date", () => {
    const result = getTenureInMonths("2024-06-01", "2024-06-01");
    expect(result).toBe(0);
  });

  it("should use current date when endDate is not provided", () => {
    const result = getTenureInMonths("2024-01-01");
    expect(result).toBe(12);
  });

  it("should return 0 for invalid start date", () => {
    const result = getTenureInMonths("not-a-date", "2024-06-01");
    expect(result).toBe(0);
  });

  it("should return 0 for invalid end date", () => {
    const result = getTenureInMonths("2024-01-01", "invalid");
    expect(result).toBe(0);
  });

  it("should return 0 when end is before start", () => {
    const result = getTenureInMonths("2024-06-01", "2024-01-01");
    expect(result).toBe(0);
  });

  it("should handle multi-year spans", () => {
    const result = getTenureInMonths("2020-01-01", "2024-01-01");
    expect(result).toBe(48);
  });

  it("should floor partial months", () => {
    const result = getTenureInMonths("2024-01-01", "2024-02-15");
    expect(result).toBe(1);
  });
});
