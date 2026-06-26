import { ToastType } from "~community/common/enums/ComponentEnums";
import { ApplyLeaveToastEnums } from "~community/leave/enums/MyRequestEnums";
import { MyRequestsToastMsgKeyEnums } from "~community/leave/enums/ToastMsgKeyEnums";

import { handleApplyLeaveApiResponse } from "./apiUtils";

describe("handleApplyLeaveApiResponse", () => {
  const setToastMessage = jest.fn();
  const translateText = jest.fn((key) => key.join("."));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle APPLY_LEAVE_SUCCESS", () => {
    handleApplyLeaveApiResponse({
      type: ApplyLeaveToastEnums.APPLY_LEAVE_SUCCESS,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      key: MyRequestsToastMsgKeyEnums.APPLY_LEAVE_SUCCESS,
      open: true,
      toastType: ToastType.SUCCESS,
      title: "toastMessages.leaveAppliedSuccess.title",
      description: "toastMessages.leaveAppliedSuccess.description"
    });
  });

  it("should handle APPLY_LEAVE_ERROR", () => {
    handleApplyLeaveApiResponse({
      type: ApplyLeaveToastEnums.APPLY_LEAVE_ERROR,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      key: MyRequestsToastMsgKeyEnums.APPLY_LEAVE_ERROR,
      open: true,
      toastType: ToastType.ERROR,
      title: "toastMessages.leaveAppliedError.title",
      description: "toastMessages.leaveAppliedError.description"
    });
  });

  it("should handle LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT", () => {
    handleApplyLeaveApiResponse({
      type: ApplyLeaveToastEnums.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).toHaveBeenCalledWith({
      key: MyRequestsToastMsgKeyEnums.INSUFFICIENT_BALANCE_ERROR,
      open: true,
      toastType: ToastType.ERROR,
      title: "toastMessages.insufficientBalance.title",
      description: "toastMessages.insufficientBalance.description"
    });
  });

  it("should handle default case", () => {
    handleApplyLeaveApiResponse({
      type: "UNKNOWN_TYPE" as ApplyLeaveToastEnums,
      setToastMessage,
      translateText
    });

    expect(setToastMessage).not.toHaveBeenCalled();
  });
});
