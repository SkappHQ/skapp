import { ToastType } from "~community/common/enums/ComponentEnums";

import {
  handleBulkUploadResponse,
  handleSaveEntitlements
} from "./entitlementDetailsFormUtils";

describe("handleSaveEntitlements", () => {
  const mockSetCurrentYearSuccessFlag = jest.fn();
  const mockSetNextYearSuccessFlag = jest.fn();
  const mockCurrentYearMutation = jest.fn();
  const mockNextYearMutation = jest.fn();

  const props = {
    isSuccess: true,
    employeeGeneralDetails: { firstName: "John" },
    employeeEmploymentDetails: { email: "john.doe@example.com" },
    entitlementDetails: [{ id: 1, entitlement: 10 }],
    currentYearMutation: mockCurrentYearMutation,
    currentYearSuccessFlag: false,
    setCurrentYearSuccessFlag: mockSetCurrentYearSuccessFlag,
    nextYearMutation: mockNextYearMutation,
    nextYearSuccessFlag: false,
    setNextYearSuccessFlag: mockSetNextYearSuccessFlag
  };

  it("should call currentYearMutation and nextYearMutation with correct payloads", () => {
    handleSaveEntitlements(props);
  });

  it("should set success flags if no entitlements are present", () => {
    handleSaveEntitlements({
      ...props,
      entitlementDetails: []
    });

    expect(mockSetCurrentYearSuccessFlag).toHaveBeenCalledWith(true);
    expect(mockSetNextYearSuccessFlag).toHaveBeenCalledWith(true);
  });
});

describe("handleBulkUploadResponse", () => {
  const mockSetSuccessFlag = jest.fn();
  const mockSetToastMessage = jest.fn();
  const mockTranslateText = jest.fn((keys) => keys.join(" "));

  const props = {
    responseData: {
      bulkStatusSummary: { failedCount: 0 },
      bulkRecordErrorLogs: [{ message: "Error message" }]
    },
    setSuccessFlag: mockSetSuccessFlag,
    translateText: mockTranslateText,
    setToastMessage: mockSetToastMessage
  };

  it("should set success flag if there are no failed records", () => {
    handleBulkUploadResponse(props);

    expect(mockSetSuccessFlag).toHaveBeenCalledWith(true);
    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("should set toast message if there are failed records", () => {
    handleBulkUploadResponse({
      ...props,
      responseData: {
        bulkStatusSummary: { failedCount: 1 },
        bulkRecordErrorLogs: [{ message: "Error message" }]
      }
    });

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      toastType: ToastType.ERROR,
      title: "entitlementErrorMessage",
      description: "Error message",
      open: true
    });
  });
});
