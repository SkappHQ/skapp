import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import MockTheme from "~community/common/mocks/MockTheme";

import BulkUploadSummary from "./BulkUploadSummary";

// Mock hooks and functions
jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (key: string[], params?: Record<string, any>) =>
    params
      ? `${key[key.length - 1]} ${JSON.stringify(params)}`
      : key[key.length - 1]
}));

jest.mock("~community/people/utils/holidayUtils/commonUtils", () => ({
  downloadUserBulkUploadErrorLogsCSV: jest.fn(),
  downloadHolidayBulkUploadErrorLogsCSV: jest.fn()
}));

describe("BulkUploadSummary", () => {
  const mockSetPopupType = jest.fn();
  const mockDownloadUserCSV =
    require("~community/people/utils/holidayUtils/commonUtils").downloadUserBulkUploadErrorLogsCSV;
  const mockDownloadHolidayCSV =
    require("~community/people/utils/holidayUtils/commonUtils").downloadHolidayBulkUploadErrorLogsCSV;

  const mockData = {
    bulkStatusSummary: {
      successCount: 2,
      failedCount: 1
    },
    bulkRecordErrorLogs: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls downloadHolidayBulkUploadErrorLogsCSV when download button is clicked for HOLIDAY_BULK_UPLOAD flow", () => {
    render(
      <MockTheme>
        <BulkUploadSummary
          setPopupType={mockSetPopupType}
          data={mockData}
          flow="HOLIDAY_BULK_UPLOAD"
        />
      </MockTheme>
    );

    const downloadButton = screen.getByText("addBulkUploadSummaryButton");
    fireEvent.click(downloadButton);

    expect(mockDownloadHolidayCSV).toHaveBeenCalledWith(mockData);
    expect(mockSetPopupType).toHaveBeenCalledWith("NONE");
  });
});
