import { DateTime } from "luxon";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  addHours,
  convertDateTimeToDate,
  convertDateToFormat,
  convertDateToUTC,
  convertToYYYYMMDDFromDate,
  convertToYYYYMMDDFromDateTime,
  convertUTCStringToLocalDateTime,
  formatDateTimeWithOrdinalIndicator,
  formatDateTimeWithOrdinalIndicatorWithoutYear,
  formatDateToISOString,
  formatDateWithOrdinalIndicator,
  formatDateWithOrdinalSuffix,
  formatDayWithOrdinalIndicator,
  fromDateToRelativeTime,
  generateTimeArray,
  generateTimezoneList,
  getAdjacentYearsWithCurrent,
  getCurrentMonth,
  getDateFromTimeStamp,
  getDayDifference,
  getFirstDateOfYear,
  getFormattedDate,
  getFormattedMonth,
  getFormattedYear,
  getLocalDate,
  getMonthName,
  getOrdinalIndicator,
  getRecentYearsInStrings,
  getStandardDate,
  getStartAndEndDateOfTheMonth,
  getStartAndEndOfCurrentMonth,
  getStartAndEndOfCurrentWeek,
  getTimeElapsedSinceDate,
  getTimeOffset,
  getYearStartAndEndDates,
  isDateGraterThanToday,
  isDateTimeSimilar,
  parseStringWithCurrentYearAndConvertToDateTime
} from "~community/common/utils/dateTimeUtils";

describe("dateTimeUtils", () => {
  test("formatDateToISOString should format date to ISO string", () => {
    const date = new Date("2023-10-10T00:00:00Z");
    expect(formatDateToISOString(date)).toBe("2023-10-10");
  });

  test("getDateFromTimeStamp should extract date from timestamp", () => {
    const timestamp = "2023-10-10T12:34:56Z";
    expect(getDateFromTimeStamp(timestamp)).toBe("2023-10-10");
  });

  test("getOrdinalIndicator should return correct ordinal indicator", () => {
    expect(getOrdinalIndicator(1)).toBe("st");
    expect(getOrdinalIndicator(2)).toBe("nd");
    expect(getOrdinalIndicator(3)).toBe("rd");
    expect(getOrdinalIndicator(4)).toBe("th");
  });

  test("formatDateWithOrdinalIndicator should format date with ordinal indicator", () => {
    const date = new Date("2023-10-10T00:00:00Z");
    expect(formatDateWithOrdinalIndicator(date)).toBe("10th Oct 2023");
  });

  test("formatDateTimeWithOrdinalIndicator should format DateTime with ordinal indicator", () => {
    const dateTime = DateTime.fromISO("2023-10-10T00:00:00Z");
    expect(formatDateTimeWithOrdinalIndicator(dateTime)).toBe("10th Oct 2023");
  });

  test("formatDateTimeWithOrdinalIndicatorWithoutYear should format DateTime without year", () => {
    const dateTime = DateTime.fromISO("2023-10-10T00:00:00Z");
    expect(formatDateTimeWithOrdinalIndicatorWithoutYear(dateTime)).toBe(
      "10th Oct"
    );
  });

  test("formatDayWithOrdinalIndicator should format day with ordinal indicator", () => {
    const dateTime = DateTime.fromISO("2023-10-10T00:00:00Z");
    expect(formatDayWithOrdinalIndicator(dateTime)).toBe("10th");
  });

  test("formatDateWithOrdinalSuffix should format ISO date string with ordinal suffix", () => {
    const isoDateString = "2023-10-10";
    expect(formatDateWithOrdinalSuffix(isoDateString)).toBe("10th Oct 2023");
  });

  test("getLocalDate should return local date string", () => {
    const date = new Date("2023-10-10T00:00:00Z");
    expect(getLocalDate(date)).toBe("2023-10-10");
  });

  test("convertDateToFormat should convert date to specified format", () => {
    const date = new Date("2023-10-10T00:00:00Z");
    expect(convertDateToFormat(date, "yyyy-MM-dd")).toBe("2023-10-10");
  });

  test("generateTimeArray should generate array of time labels and values", () => {
    const timeArray = generateTimeArray();
    expect(timeArray.length).toBe(96);
    expect(timeArray[0]).toEqual({ label: "12:00 AM", value: "00:00:00" });
  });

  test("getAdjacentYearsWithCurrent should return adjacent years with current year", () => {
    const years = getAdjacentYearsWithCurrent();
    const currentYear = new Date().getFullYear();
    expect(years).toEqual([
      `${currentYear - 1}`,
      `${currentYear}`,
      `${currentYear + 1}`
    ]);
  });

  test("getStandardDate should return formatted standard date", () => {
    const date = "2023-10-10T00:00:00Z";
    expect(getStandardDate(date)).toBe("10th Oct 2023 ");
  });

  test("getFormattedDate should return formatted date", () => {
    const date = "2023-10-10T00:00:00Z";
    expect(getFormattedDate(date)).toBe("10th");
  });

  test("getFormattedMonth should return formatted month", () => {
    const date = "2023-10-10T00:00:00Z";
    expect(getFormattedMonth(date)).toBe("Oct");
  });

  test("getFormattedYear should return formatted year", () => {
    const date = "2023-10-10T00:00:00Z";
    expect(getFormattedYear(date)).toBe("2023");
  });

  test("convertDateToUTC should convert date to UTC", () => {
    const date = "2023-10-10T00:00:00Z";
    expect(convertDateToUTC(date)).toBe("2023-10-10T00:00:00.000Z");
  });

  test("getFirstDateOfYear should return first date of year", () => {
    const date = getFirstDateOfYear(2023);
    expect(date.toISODate()).toBe("2023-01-01");
  });

  test("getStartAndEndOfCurrentWeek should return start and end of current week", () => {
    const { startOfWeek, endOfWeek } = getStartAndEndOfCurrentWeek();
    expect(startOfWeek).toBeInstanceOf(Date);
    expect(endOfWeek).toBeInstanceOf(Date);
  });

  test("getStartAndEndOfCurrentMonth should return start and end of current month", () => {
    const { startOfMonth, endOfMonth } = getStartAndEndOfCurrentMonth();
    expect(startOfMonth).toBeInstanceOf(Date);
    expect(endOfMonth).toBeInstanceOf(Date);
  });

  test("isDateGraterThanToday should return true if date is greater than today", () => {
    const date = DateTime.now().plus({ days: 1 }).toISO();
    expect(isDateGraterThanToday(date)).toBe(true);
  });

  test("getTimeElapsedSinceDate should return time elapsed since date", () => {
    const date = DateTime.now().minus({ years: 1, months: 2, days: 3 }).toISO();
    expect(getTimeElapsedSinceDate(date)).toBe("1y 2m 3d");
  });

  test("convertDateTimeToDate should convert DateTime to date", () => {
    const dateTime = DateTime.fromISO("2023-10-10T00:00:00Z");
    const date = convertDateTimeToDate(dateTime);
    expect(date.toISOString()).toBe("2023-10-10T00:00:00.000Z");
  });

  test("isDateTimeSimilar should return true if DateTime objects are similar", () => {
    const dateTime1 = DateTime.fromISO("2023-10-10T00:00:00Z");
    const dateTime2 = DateTime.fromISO("2023-10-10T12:00:00Z");
    expect(isDateTimeSimilar(dateTime1, dateTime2)).toBe(true);
  });

  test("getTimeOffset should return time offset", () => {
    const offset = getTimeOffset();
    expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
  });

  test("addHours should add hours to initial time", () => {
    const initialTime = "12:00";
    const format = "HH:mm";
    const hours = 2;
    expect(addHours(initialTime, format, hours)).toBe("14:00");
  });

  test("getCurrentMonth should return current month", () => {
    const month = getCurrentMonth();
    expect(month).toBe(new Date().getMonth() + 1);
  });

  test("getMonthName should return month name", () => {
    const monthName = getMonthName(10);
    expect(monthName).toBe("October");
  });

  test("getYearStartAndEndDates should return start and end dates of year", () => {
    const { start, end } = getYearStartAndEndDates(2023);
    expect(start).toBe("2023-01-01");
    expect(end).toBe("2023-12-31");
  });

  test("getStartAndEndDateOfTheMonth should return start and end dates of the month", () => {
    const { start, end } = getStartAndEndDateOfTheMonth();
    expect(start).toMatch(/^\d{4}-\d{2}-01$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("convertToYYYYMMDDFromDate should convert date to YYYY-MM-DD format", () => {
    const date = new Date("2023-10-10T00:00:00Z");
    expect(convertToYYYYMMDDFromDate(date)).toBe("2023-10-10");
  });

  test("convertToYYYYMMDDFromDateTime should convert DateTime to YYYY-MM-DD format", () => {
    const dateTime = DateTime.fromISO("2023-10-10T00:00:00Z");
    expect(convertToYYYYMMDDFromDateTime(dateTime)).toBe("2023-10-10");
  });

  test("parseStringWithCurrentYearAndConvertToDateTime should parse string and convert to DateTime", () => {
    const dateString = "10 Oct";
    const dateTime = parseStringWithCurrentYearAndConvertToDateTime(dateString);
    const currentYear = new Date().getFullYear();
    expect(dateTime.toISO()).toMatch(`${currentYear}-10-10T00:00:00.000+05:30`);
  });
});

describe("convertUTCStringToLocalDateTime", () => {
  it("should treat the string as UTC even without a Z suffix", () => {
    const result = convertUTCStringToLocalDateTime("2026-06-18T00:00:00");
    expect(result.isValid).toBe(true);
    expect(result.zoneName).toBe(DateTime.local().zoneName);
  });

  it("should produce the same instant as a string with Z suffix", () => {
    const withoutZ = convertUTCStringToLocalDateTime("2026-06-18T18:30:00");
    const withZ = convertUTCStringToLocalDateTime("2026-06-18T18:30:00Z");
    expect(withoutZ.toMillis()).toBe(withZ.toMillis());
  });

  it("should return the correct local date for a UTC time that crosses midnight", () => {
    // e.g. UTC 18:30 on the 17th = local midnight on the 18th in UTC+5:30
    const result = convertUTCStringToLocalDateTime("2026-06-17T18:30:00");
    const expectedDate = DateTime.fromISO("2026-06-17T18:30:00", {
      zone: "UTC"
    }).setZone("local");
    expect(result.day).toBe(expectedDate.day);
    expect(result.month).toBe(expectedDate.month);
    expect(result.year).toBe(expectedDate.year);
  });
});

describe("parseStringWithCurrentYearAndConvertToDateTime", () => {
  it("should parse a valid date string and return a DateTime object with the current year", () => {
    const dateString = "25TH DEC";
    const result = parseStringWithCurrentYearAndConvertToDateTime(dateString);
    const expectedDate = DateTime.now().set({
      year: DateTime.now().year,
      month: 12,
      day: 25,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    });

    expect(result.toISO()).toBe(expectedDate.toISO());
  });

  it("should handle single-digit days correctly", () => {
    const dateString = "5TH JAN";
    const result = parseStringWithCurrentYearAndConvertToDateTime(dateString);
    const expectedDate = DateTime.now().set({
      year: DateTime.now().year,
      month: 1,
      day: 5,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    });

    expect(result.toISO()).toBe(expectedDate.toISO());
  });

  it("should handle different month formats", () => {
    const dateString = "15TH FEB";
    const result = parseStringWithCurrentYearAndConvertToDateTime(dateString);
    const expectedDate = DateTime.now().set({
      year: DateTime.now().year,
      month: 2,
      day: 15,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    });

    expect(result.toISO()).toBe(expectedDate.toISO());
  });

  it("should return an invalid DateTime object for invalid date strings", () => {
    const dateString = "invalid date";
    const result = parseStringWithCurrentYearAndConvertToDateTime(dateString);

    expect(result.isValid).toBe(false);
  });

  it("should handle empty date strings", () => {
    const dateString = "";
    const result = parseStringWithCurrentYearAndConvertToDateTime(dateString);

    expect(result.isValid).toBe(false);
  });
});

describe("getRecentYearsInStrings", () => {
  let originalDateTime: typeof DateTime;

  beforeEach(() => {
    originalDateTime = DateTime;
  });

  afterEach(() => {
    (global as any).DateTime = originalDateTime;
  });

  it("returns an array of two string years", () => {
    const mockCurrentYear = new Date().getFullYear();

    (globalThis as any).DateTime = {
      local: jest.fn().mockReturnValue({
        year: mockCurrentYear
      })
    } as any;

    const result = getRecentYearsInStrings();

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(mockCurrentYear.toString());
    expect(result[1]).toBe((mockCurrentYear + 1).toString());
  });

  it("returns correct years for end of year", () => {
    const mockCurrentYear = new Date().getFullYear();

    (global as any).DateTime = {
      local: jest.fn().mockReturnValue({
        year: mockCurrentYear
      })
    } as any;

    const result = getRecentYearsInStrings();

    expect(result[0]).toBe(mockCurrentYear.toString());
    expect(result[1]).toBe((mockCurrentYear + 1).toString());
  });

  it("returns years as strings", () => {
    const mockCurrentYear = 2024;

    (global as any).DateTime = {
      local: jest.fn().mockReturnValue({
        year: mockCurrentYear
      })
    } as any;

    const result = getRecentYearsInStrings();

    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("string");
  });
});

describe("generateTimezoneList", () => {
  const mockDate = new Date("2024-01-01T00:00:00Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return an array of timezone objects with label and value properties", () => {
    const result = generateTimezoneList();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    result.forEach((item) => {
      expect(item).toHaveProperty("label", expect.any(String));
      expect(item).toHaveProperty("value", expect.any(String));
    });
  });

  it("should sort timezones by GMT offset", () => {
    const result = generateTimezoneList();

    for (let i = 1; i < result.length; i++) {
      const prevOffset = parseInt(
        (result[i - 1].label as string).match(/GMT([+-]\d+)/)?.[1] || "0"
      );
      const currentOffset = parseInt(
        (result[i].label as string).match(/GMT([+-]\d+)/)?.[1] || "0"
      );

      expect(prevOffset).toBeLessThanOrEqual(currentOffset);
    }
  });

  it("should return an empty array if no timezones are supported", () => {
    const originalSupportedValuesOf = Intl.supportedValuesOf;
    global.Intl.supportedValuesOf = jest.fn().mockReturnValue([]);

    const result = generateTimezoneList();

    expect(result).toEqual([]);

    global.Intl.supportedValuesOf = originalSupportedValuesOf;
  });
});

describe("getDayDifference", () => {
  it("returns the number of whole days between two dates", () => {
    const from = DateTime.local(2024, 1, 1);
    const to = DateTime.local(2024, 1, 4);

    expect(getDayDifference(from, to)).toBe(3);
  });

  it("returns 0 for two date times on the same day", () => {
    const from = DateTime.local(2024, 1, 1, 8, 30);
    const to = DateTime.local(2024, 1, 1, 22, 15);

    expect(getDayDifference(from, to)).toBe(0);
  });

  it("ignores the time of day when calculating the difference", () => {
    const from = DateTime.local(2024, 1, 1, 23, 59);
    const to = DateTime.local(2024, 1, 2, 0, 1);

    expect(getDayDifference(from, to)).toBe(1);
  });

  it("returns a negative value when 'to' is before 'from'", () => {
    const from = DateTime.local(2024, 1, 5);
    const to = DateTime.local(2024, 1, 2);

    expect(getDayDifference(from, to)).toBe(-3);
  });
});

describe("formatRelativeDateTime", () => {
  const mockTranslate: TranslatorFunctionType = (
    suffixes,
    interpolationValues
  ) => {
    const translations: Record<string, string> = {
      unknownDate: "Unknown date",
      at: "at"
    };

    const key = suffixes[0];
    let translation = translations[key];

    if (translation && interpolationValues) {
      Object.entries(interpolationValues).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, value);
      });
    }

    return translation || suffixes.join(".");
  };

  it("should return a formatted string with a relative date and time", () => {
    const mockDate = DateTime.now().minus({ days: 1 }).toISO();
    const result = fromDateToRelativeTime(
      mockDate,
      mockTranslate,
      "en",
      undefined
    );

    expect(result).toContain("Yesterday at");
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });

  it("should handle invalid dates gracefully", () => {
    const result = fromDateToRelativeTime(
      "invalid-date",
      mockTranslate,
      "en",
      undefined
    );
    expect(result).toBe("Unknown date at Invalid DateTime");
  });

  it("should capitalize the first word of the relative date", () => {
    const mockDate = DateTime.now().minus({ days: 1 }).toISO();
    const result = fromDateToRelativeTime(
      mockDate,
      mockTranslate,
      "en",
      undefined
    );
    expect(result.startsWith("Yesterday")).toBeTruthy();
  });

  it("should return the correct format for 'Today'", () => {
    const mockDate = DateTime.now().toISO();
    const result = fromDateToRelativeTime(
      mockDate,
      mockTranslate,
      "en",
      undefined
    );
    expect(result).toMatch(/Today at \d{1,2}:\d{2} (AM|PM)/);
  });
});
