import { LeaveEntitlementToastEnums } from "~community/leave/enums/LeaveEntitlementEnums";

import { handleLeaveEntitlementApiResponse } from "./apiUtils";

describe("handleLeaveEntitlementApiResponse", () => {
  let setToastMessage: jest.Mock;
  let translateText: jest.Mock;

  beforeEach(() => {
    setToastMessage = jest.fn();
    translateText = jest.fn((key, data) => `${key} ${JSON.stringify(data)}`);
  });

  it("should handle BULK_UPLOAD_PARTIAL_SUCCESS", () => {
    handleLeaveEntitlementApiResponse({
      type: LeaveEntitlementToastEnums.BULK_UPLOAD_PARTIAL_SUCCESS,
      setToastMessage,
      translateText,
      selectedYear: "2023",
      noOfRecords: 10
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "success",
      title:
        'toastMessages.bulkUploadPartialSuccessTitle {"selectedYear":"2023"}',
      description:
        'toastMessages.bulkUploadPartialSuccessDescription {"noOfRecords":10}'
    });
  });

  it("should handle BULK_UPLOAD_COMPLETE_SUCCESS", () => {
    handleLeaveEntitlementApiResponse({
      type: LeaveEntitlementToastEnums.BULK_UPLOAD_COMPLETE_SUCCESS,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "success",
      title: "toastMessages.bulkUploadCompleteSuccessTitle undefined",
      description:
        "toastMessages.bulkUploadCompleteSuccessDescription undefined"
    });
  });

  it("should handle BULK_UPLOAD_ERROR", () => {
    handleLeaveEntitlementApiResponse({
      type: LeaveEntitlementToastEnums.BULK_UPLOAD_ERROR,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "error",
      title: "toastMessages.bulkUploadErrorTitle undefined",
      description: "toastMessages.bulkUploadErrorDescription undefined"
    });
  });

  it("should handle default case", () => {
    handleLeaveEntitlementApiResponse({
      type: "UNKNOWN_TYPE" as LeaveEntitlementToastEnums,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).not.toHaveBeenCalled();
  });
});
