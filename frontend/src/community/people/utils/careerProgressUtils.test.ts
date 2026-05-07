import { DateTime, Settings } from "luxon";

import {
  calculateTenure,
  formatTenureLabel,
  getTenureInMonths
} from "./careerProgressUtils";

describe("careerProgressUtils", () => {
  describe("calculateTenure", () => {
    beforeAll(() => {
      Settings.now = () => new Date("2025-06-15T00:00:00.000Z").valueOf();
    });

    afterAll(() => {
      Settings.now = () => Date.now();
    });

    it("should return years and months when tenure is more than a year", () => {
      const result = calculateTenure({
        startDate: "2023-01-15",
        endDate: "2025-06-15",
        currentPosition: false
      });
      expect(result).toBe("2y 5m");
    });

    it("should return only months when tenure is less than a year", () => {
      const result = calculateTenure({
        startDate: "2025-01-15",
        endDate: "2025-06-15",
        currentPosition: false
      });
      expect(result).toBe("5m");
    });

    it("should return 0m when start and end are the same date", () => {
      const result = calculateTenure({
        startDate: "2025-06-15",
        endDate: "2025-06-15",
        currentPosition: false
      });
      expect(result).toBe("0m");
    });

    it("should use current date when currentPosition is true", () => {
      const result = calculateTenure({
        startDate: "2024-06-15",
        currentPosition: true
      });
      expect(result).toBe("1y 0m");
    });

    it("should handle exactly one year tenure", () => {
      const result = calculateTenure({
        startDate: "2024-06-15",
        endDate: "2025-06-15",
        currentPosition: false
      });
      expect(result).toBe("1y 0m");
    });

    it("should clamp negative values to 0 when end is before start", () => {
      const result = calculateTenure({
        startDate: "2025-06-15",
        endDate: "2024-01-01",
        currentPosition: false
      });
      expect(result).toBe("0m");
    });

    it("should return NaNm when endDate is undefined and not currentPosition", () => {
      const result = calculateTenure({
        startDate: "2025-06-15",
        currentPosition: false
      });
      // DateTime.fromISO("") is invalid, diff produces NaN
      expect(result).toBe("NaNm");
    });
  });

  describe("formatTenureLabel", () => {
    const translateText = (keys: string[]): string => keys[0];

    it("should return less_than_a_month when both years and months are 0", () => {
      const result = formatTenureLabel(0, 0, translateText);
      expect(result).toBe("less_than_a_month");
    });

    it("should return years and months when both are positive", () => {
      const result = formatTenureLabel(2, 3, translateText);
      expect(result).toBe("2 years, 3 months");
    });

    it("should return only years when months is 0", () => {
      const result = formatTenureLabel(3, 0, translateText);
      expect(result).toBe("3 years");
    });

    it("should return only months when years is 0", () => {
      const result = formatTenureLabel(0, 5, translateText);
      expect(result).toBe("5 months");
    });

    it("should use singular 'year' when years is 1", () => {
      const result = formatTenureLabel(1, 0, translateText);
      expect(result).toBe("1 year");
    });

    it("should use singular 'month' when months is 1", () => {
      const result = formatTenureLabel(0, 1, translateText);
      expect(result).toBe("1 month");
    });

    it("should use singular for both when 1 year and 1 month", () => {
      const result = formatTenureLabel(1, 1, translateText);
      expect(result).toBe("1 year, 1 month");
    });

    it("should clamp negative years to 0", () => {
      const result = formatTenureLabel(-2, 5, translateText);
      expect(result).toBe("5 months");
    });

    it("should clamp negative months to 0", () => {
      const result = formatTenureLabel(2, -3, translateText);
      expect(result).toBe("2 years");
    });

    it("should return less_than_a_month when both are negative", () => {
      const result = formatTenureLabel(-1, -1, translateText);
      expect(result).toBe("less_than_a_month");
    });

    it("should floor fractional years", () => {
      const result = formatTenureLabel(2.9, 0, translateText);
      expect(result).toBe("2 years");
    });

    it("should floor fractional months", () => {
      const result = formatTenureLabel(0, 3.7, translateText);
      expect(result).toBe("3 months");
    });

    it("should clamp months to max 11", () => {
      const result = formatTenureLabel(1, 15, translateText);
      expect(result).toBe("1 year, 11 months");
    });
  });

  describe("getTenureInMonths", () => {
    beforeAll(() => {
      Settings.now = () => new Date("2025-06-15T00:00:00.000Z").valueOf();
    });

    afterAll(() => {
      Settings.now = () => Date.now();
    });

    it("should return total months between start and end dates", () => {
      const result = getTenureInMonths("2024-01-15", "2025-06-15");
      expect(result).toBe(17);
    });

    it("should use current date when endDate is not provided", () => {
      const result = getTenureInMonths("2025-01-15");
      expect(result).toBe(5);
    });

    it("should return 0 when start date is invalid", () => {
      const result = getTenureInMonths("invalid-date", "2025-06-15");
      expect(result).toBe(0);
    });

    it("should return 0 when end date is invalid", () => {
      const result = getTenureInMonths("2024-01-15", "invalid-date");
      expect(result).toBe(0);
    });

    it("should return 0 when end is before start", () => {
      const result = getTenureInMonths("2025-06-15", "2024-01-15");
      expect(result).toBe(0);
    });

    it("should return 0 when start and end are same date", () => {
      const result = getTenureInMonths("2025-06-15", "2025-06-15");
      expect(result).toBe(0);
    });

    it("should return correct months for exactly one year", () => {
      const result = getTenureInMonths("2024-06-15", "2025-06-15");
      expect(result).toBe(12);
    });
  });
});
