import { createCSV } from "~community/common/utils/bulkUploadUtils";

import { downloadBulkCsvTemplate } from "./downloadHolidayBulkTemplateModalUtils";

jest.mock("~community/common/utils/bulkUploadUtils", () => ({
  createCSV: jest.fn()
}));

global.ReadableStream = jest.fn().mockImplementation(() => ({
  getReader: jest.fn()
}));

describe("downloadBulkCsvTemplate", () => {
  it("should call createCSV", () => {
    downloadBulkCsvTemplate();
    expect(createCSV).toHaveBeenCalled();
  });
});
