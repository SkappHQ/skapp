import { parse } from "papaparse";
import { Dispatch, SetStateAction } from "react";

import { FileUploadType } from "~community/common/types/CommonTypes";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

import {
  createLeaveEntitlementBulkUploadPayload,
  validateHeaders
} from "./leaveEntitlementUtils";
import { setAttachment } from "./uploadCsvUtils";

jest.mock("papaparse", () => ({
  parse: jest.fn()
}));

jest.mock("./leaveEntitlementUtils", () => ({
  createLeaveEntitlementBulkUploadPayload: jest.fn(),
  validateHeaders: jest.fn()
}));

describe("setAttachment", () => {
  const mockDispatch = jest.fn() as Dispatch<SetStateAction<any>>;
  const mockTranslateText = jest.fn((keys: string[]) => keys.join(", "));

  const defaultProps = {
    acceptedFiles: [{ file: new File([""], "test.csv") }] as FileUploadType[],
    leaveTypes: [] as LeaveTypeType[],
    selectedYear: "2023",
    setCustomError: mockDispatch,
    setValid: mockDispatch,
    setLeaveEntitlementBulk: mockDispatch,
    setBulkUserAttachment: mockDispatch,
    translateText: mockTranslateText
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set bulk user attachment and reset error states", async () => {
    await setAttachment(defaultProps);

    expect(mockDispatch).toHaveBeenCalledWith(defaultProps.acceptedFiles);
    expect(mockDispatch).toHaveBeenCalledWith("");
    expect(mockDispatch).toHaveBeenCalledWith(false);
  });

  it("should handle empty acceptedFiles", async () => {
    await setAttachment({ ...defaultProps, acceptedFiles: [] });

    expect(mockDispatch).toHaveBeenCalledWith([]);
  });

  it("should handle invalid headers", async () => {
    (validateHeaders as jest.Mock).mockResolvedValue(false);

    await setAttachment(defaultProps);

    expect(mockDispatch).toHaveBeenCalledWith(false);
    expect(mockDispatch).toHaveBeenCalledWith("invalidTemplateError");
  });

  it("should handle valid headers and empty CSV data", async () => {
    (validateHeaders as jest.Mock).mockResolvedValue(true);
    (parse as jest.Mock).mockImplementation((file, options) => {
      options.complete({ data: [] });
    });

    await setAttachment(defaultProps);

    expect(mockDispatch).toHaveBeenCalledWith(false);
    expect(mockDispatch).toHaveBeenCalledWith("emptyFileError");
  });

  it("should handle valid headers and non-empty CSV data", async () => {
    const mockData = [{ id: 1, name: "Test" }];
    (validateHeaders as jest.Mock).mockResolvedValue(true);
    (parse as jest.Mock).mockImplementation((file, options) => {
      options.complete({ data: mockData });
    });
    (createLeaveEntitlementBulkUploadPayload as jest.Mock).mockReturnValue(
      mockData
    );

    await setAttachment(defaultProps);

    expect(mockDispatch).toHaveBeenCalledWith(mockData);
  });
});
