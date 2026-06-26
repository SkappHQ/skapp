import ROUTES from "~community/common/constants/routes";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { LeaveTypeToastEnums } from "~community/leave/enums/LeaveTypeEnums";

import { handleLeaveTypeApiResponse } from "./apiUtils";

describe("handleLeaveTypeApiResponse", () => {
  let setToastMessage: jest.Mock;
  let translateText: jest.Mock;
  let setFormDirty: jest.Mock;
  let redirect: jest.Mock;

  beforeEach(() => {
    setToastMessage = jest.fn();
    translateText = jest.fn((key) => key.join("."));
    setFormDirty = jest.fn();
    redirect = jest.fn();
  });

  it("should handle ADD_LEAVE_TYPE_SUCCESS", () => {
    const handler = handleLeaveTypeApiResponse({
      type: LeaveTypeToastEnums.ADD_LEAVE_TYPE_SUCCESS,
      setToastMessage,
      translateText,
      setFormDirty,
      redirect
    });

    handler();

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "addLeaveTypeSuccessToastTitle",
      description: "addLeaveTypeSuccessToastDescription"
    });
    expect(setFormDirty).toHaveBeenCalledWith(false);
    expect(redirect).toHaveBeenCalledWith(ROUTES.LEAVE.LEAVE_TYPES);
  });

  it("should handle ADD_LEAVE_TYPE_ERROR", () => {
    const handler = handleLeaveTypeApiResponse({
      type: LeaveTypeToastEnums.ADD_LEAVE_TYPE_ERROR,
      setToastMessage,
      translateText
    });

    handler();

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "leaveTypeErrorToastTitle",
      description: "addLeaveTypeErrorToastDescription"
    });
  });

  it("should handle EDIT_LEAVE_TYPE_SUCCESS", () => {
    const handler = handleLeaveTypeApiResponse({
      type: LeaveTypeToastEnums.EDIT_LEAVE_TYPE_SUCCESS,
      setToastMessage,
      translateText,
      setFormDirty,
      redirect
    });

    handler();

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "editLeaveTypeSuccessToastTitle",
      description: "editLeaveTypeSuccessToastDescription"
    });
    expect(setFormDirty).toHaveBeenCalledWith(false);
    expect(redirect).toHaveBeenCalledWith(ROUTES.LEAVE.LEAVE_TYPES);
  });

  it("should handle EDIT_LEAVE_TYPE_ERROR", () => {
    const handler = handleLeaveTypeApiResponse({
      type: LeaveTypeToastEnums.EDIT_LEAVE_TYPE_ERROR,
      setToastMessage,
      translateText
    });

    handler();

    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "leaveTypeErrorToastTitle",
      description: "editLeaveTypeErrorToastDescription"
    });
  });

  it("should handle default case", () => {
    const handler = handleLeaveTypeApiResponse({
      type: "UNKNOWN_TYPE" as LeaveTypeToastEnums,
      setToastMessage,
      translateText
    });

    handler();

    expect(setToastMessage).not.toHaveBeenCalled();
    expect(setFormDirty).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
