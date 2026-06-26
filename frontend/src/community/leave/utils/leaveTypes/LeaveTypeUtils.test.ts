import { ClipboardEvent, KeyboardEvent } from "react";

import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

import {
  carryForwardKeyDownRestriction,
  carryForwardPasteRestriction,
  getEmoji,
  getIsActiveFieldDirtyStatus,
  getLeaveTypeDurationTableContent,
  getTruncatedLabel,
  handleColorClick,
  handleLeaveDurationClick,
  leaveTypeDurationSelector
} from "./LeaveTypeUtils";

describe("LeaveTypeUtils", () => {
  test("leaveTypeDurationSelector returns correct duration", () => {
    expect(leaveTypeDurationSelector(LeaveDurationTypes.HALF_DAY)).toBe(
      "Half Day"
    );
    expect(leaveTypeDurationSelector(LeaveDurationTypes.FULL_DAY)).toBe(
      "Full Day"
    );
    expect(
      leaveTypeDurationSelector(LeaveDurationTypes.HALF_AND_FULL_DAY)
    ).toBe("");
    expect(leaveTypeDurationSelector(LeaveDurationTypes.NONE)).toBe("");
  });

  test("carryForwardKeyDownRestriction prevents invalid keys", () => {
    const preventDefault = jest.fn();
    const event = {
      key: "a",
      preventDefault,
      ctrlKey: false
    } as unknown as KeyboardEvent<HTMLInputElement>;

    carryForwardKeyDownRestriction(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  test("carryForwardPasteRestriction prevents invalid paste", () => {
    const preventDefault = jest.fn();
    const event = {
      clipboardData: {
        getData: () => "abc"
      },
      preventDefault
    } as unknown as ClipboardEvent<HTMLInputElement>;

    carryForwardPasteRestriction(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  test("getTruncatedLabel truncates long labels", () => {
    expect(getTruncatedLabel("This is a long label")).toBe("This i...");
    expect(getTruncatedLabel("Short")).toBe("Short");
  });

  test("getEmoji returns correct emoji", () => {
    expect(getEmoji("&#128512;")).toBe("😀");
    expect(getEmoji("text")).toBe("text");
  });

  test("getLeaveTypeDurationTableContent returns correct content", () => {
    expect(
      getLeaveTypeDurationTableContent(LeaveDurationTypes.HALF_DAY)
    ).toEqual(["Half Day"]);
    expect(
      getLeaveTypeDurationTableContent(LeaveDurationTypes.FULL_DAY)
    ).toEqual(["Full Day"]);
    expect(
      getLeaveTypeDurationTableContent(LeaveDurationTypes.HALF_AND_FULL_DAY)
    ).toEqual(["Full Day", "Half Day"]);
    expect(getLeaveTypeDurationTableContent(LeaveDurationTypes.NONE)).toEqual(
      []
    );
  });

  test("handleLeaveDurationClick updates duration correctly", () => {
    const setFieldValue = jest.fn();
    const setFieldError = jest.fn();
    const values = { leaveDuration: LeaveDurationTypes.NONE };

    handleLeaveDurationClick(
      values,
      LeaveDurationTypes.HALF_DAY,
      setFieldValue,
      setFieldError
    );
    expect(setFieldValue).toHaveBeenCalledWith(
      "leaveDuration",
      LeaveDurationTypes.HALF_DAY
    );
    expect(setFieldError).toHaveBeenCalledWith("leaveDuration", "");
  });

  test("handleColorClick updates colors correctly", () => {
    const setColors = jest.fn();
    const setFieldValue = jest.fn();
    const setFieldError = jest.fn();
    const colors = ["red", "blue"];

    handleColorClick({
      color: "green",
      colors,
      setColors,
      setFieldValue,
      setFieldError
    });

    expect(setColors).toHaveBeenCalledWith(["green", "red", "blue"]);
    expect(setFieldValue).toHaveBeenCalledWith("colorCode", "green");
    expect(setFieldError).toHaveBeenCalledWith("colorCode", "");
  });

  test("getIsActiveFieldDirtyStatus returns correct status", () => {
    const editingLeaveType = { typeId: 1, isActive: true } as LeaveTypeType;
    const allLeaveTypes = [{ typeId: 1, isActive: false }] as LeaveTypeType[];

    expect(getIsActiveFieldDirtyStatus(editingLeaveType, allLeaveTypes)).toBe(
      true
    );
  });
});
