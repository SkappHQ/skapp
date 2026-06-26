import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { holidayBulkUploadResponse } from "~community/people/types/HolidayTypes";

import {
  downloadHolidayBulkUploadErrorLogsCSV,
  getFormattedDate,
  getFormattedYear,
  getLongFormattedMonth,
  getShortDayName
} from "./commonUtils";

jest.mock("~community/common/utils/bulkUploadUtils", () => ({
  createCSV: jest.fn()
}));

class MockReadableStream {
  constructor(private source: any) {}
}

global.ReadableStream = MockReadableStream as any;

describe("Holiday Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getFormattedYear", () => {
    it("should return the year from a date string", () => {
      expect(getFormattedYear("2024-01-01")).toBe("2024");
      expect(getFormattedYear("2023-12-31")).toBe("2023");
    });
  });

  describe("getLongFormattedMonth", () => {
    it("should return the full month name", () => {
      expect(getLongFormattedMonth("2024-01-15")).toBe("January");
      expect(getLongFormattedMonth("2024-12-25")).toBe("December");
    });
  });

  describe("getShortDayName", () => {
    it("should return short day name for valid date", () => {
      expect(getShortDayName("2024-01-01")).toBe("Mon");
      expect(getShortDayName("2024-01-07")).toBe("Sun");
    });
  });

  describe("getFormattedDate", () => {
    it("should add correct suffix to day numbers", () => {
      expect(getFormattedDate("2024-01-01")).toBe("1st");
      expect(getFormattedDate("2024-01-02")).toBe("2nd");
      expect(getFormattedDate("2024-01-03")).toBe("3rd");
      expect(getFormattedDate("2024-01-04")).toBe("4th");
      expect(getFormattedDate("2024-01-21")).toBe("21st");
      expect(getFormattedDate("2024-01-22")).toBe("22nd");
      expect(getFormattedDate("2024-01-23")).toBe("23rd");
    });

    it("should return full date format when fullDate is true", () => {
      expect(getFormattedDate("2024-01-01", true)).toBe("1st Jan 2024");
      expect(getFormattedDate("2024-12-25", true)).toBe("25th Dec 2024");
    });
  });

  describe("downloadBulkUploadErrorLogsCSV", () => {
    it("should create error logs CSV with correct format", () => {
      const mockErrorData: holidayBulkUploadResponse = {
        bulkStatusSummary: {
          successCount: 1,
          failedCount: 2
        },
        bulkRecordErrorLogs: [
          {
            status: "ERROR",
            errorMessage: "Invalid date format",
            holiday: {
              date: "2024-01-01",
              name: "New Year",
              holidayDuration: "FULL_DAY"
            }
          },
          {
            status: "ERROR",
            errorMessage: "Missing name",
            holiday: {
              date: "2024-12-25",
              name: "",
              holidayDuration: "FULL_DAY"
            }
          }
        ]
      };

      downloadHolidayBulkUploadErrorLogsCSV(mockErrorData);

      expect(createCSV).toHaveBeenCalledTimes(1);
      expect(createCSV).toHaveBeenCalledWith(
        expect.any(MockReadableStream),
        "bulk-upload-error-log"
      );
    });

    it("should handle empty error logs", () => {
      const emptyErrorData: holidayBulkUploadResponse = {
        bulkStatusSummary: {
          successCount: 0,
          failedCount: 0
        },
        bulkRecordErrorLogs: []
      };

      downloadHolidayBulkUploadErrorLogsCSV(emptyErrorData);

      expect(createCSV).toHaveBeenCalledTimes(1);
      expect(createCSV).toHaveBeenCalledWith(
        expect.any(MockReadableStream),
        "bulk-upload-error-log"
      );
    });
  });
});
