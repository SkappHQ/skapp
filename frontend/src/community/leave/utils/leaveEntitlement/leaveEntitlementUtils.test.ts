import * as React from "react";

import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";

import {
  carryForwardKeyDownRestriction,
  carryForwardPasteRestriction,
  leaveTypeDurationSelector
} from "../leaveTypes/LeaveTypeUtils";

describe("leaveTypeDurationSelector", () => {
  it("should return 'Half Day' for LeaveDurationTypes.HALF_DAY", () => {
    const result = leaveTypeDurationSelector(LeaveDurationTypes.HALF_DAY);
    expect(result).toBe("Half Day");
  });

  it("should return 'Full Day' for LeaveDurationTypes.FULL_DAY", () => {
    const result = leaveTypeDurationSelector(LeaveDurationTypes.FULL_DAY);
    expect(result).toBe("Full Day");
  });

  it("should return an empty string for LeaveDurationTypes.HALF_AND_FULL_DAY", () => {
    const result = leaveTypeDurationSelector(
      LeaveDurationTypes.HALF_AND_FULL_DAY
    );
    expect(result).toBe("");
  });

  it("should return an empty string for LeaveDurationTypes.NONE", () => {
    const result = leaveTypeDurationSelector(LeaveDurationTypes.NONE);
    expect(result).toBe("");
  });
});

describe("carryForwardKeyDownRestriction", () => {
  let event: Partial<React.KeyboardEvent<HTMLInputElement>>;

  beforeEach(() => {
    event = {
      preventDefault: jest.fn(),
      key: "",
      ctrlKey: false
    };
  });

  it("should allow number keys", () => {
    event.key = "3";
    carryForwardKeyDownRestriction(
      event as React.KeyboardEvent<HTMLInputElement>
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("should prevent non-numeric keys", () => {
    event.key = "a";
    carryForwardKeyDownRestriction(
      event as React.KeyboardEvent<HTMLInputElement>
    );
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("should allow Backspace", () => {
    event.key = "Backspace";
    carryForwardKeyDownRestriction(
      event as React.KeyboardEvent<HTMLInputElement>
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("should allow Ctrl + a, c, v, x", () => {
    const allowedKeys = ["a", "c", "v", "x"];
    event.ctrlKey = true;

    allowedKeys.forEach((key) => {
      event.key = key;
      carryForwardKeyDownRestriction(
        event as React.KeyboardEvent<HTMLInputElement>
      );
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});

describe("carryForwardPasteRestriction", () => {
  let event: Partial<React.ClipboardEvent<HTMLInputElement>>;

  beforeEach(() => {
    event = {
      preventDefault: jest.fn(),
      clipboardData: {
        getData: jest.fn(),
        dropEffect: "none",
        effectAllowed: "all",
        files: [] as File[],
        items: [] as unknown as DataTransferItemList,
        types: [] as string[]
      } as unknown as DataTransfer
    };
  });

  it("should allow pasting numbers", () => {
    event.clipboardData!.getData = jest.fn().mockReturnValue("123");
    carryForwardPasteRestriction(
      event as React.ClipboardEvent<HTMLInputElement>
    );
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("should prevent pasting non-numeric content", () => {
    event.clipboardData!.getData = jest.fn().mockReturnValue("abc");
    carryForwardPasteRestriction(
      event as React.ClipboardEvent<HTMLInputElement>
    );
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
