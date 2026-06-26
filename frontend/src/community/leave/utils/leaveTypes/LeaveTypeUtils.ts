import * as React from "react";

import { hasNumber } from "~community/common/regex/regexPatterns";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

export const leaveTypeDurationSelector = (leaveType: LeaveDurationTypes) => {
  const durationMapper: Record<LeaveDurationTypes, string> = {
    [LeaveDurationTypes.HALF_DAY]: "Half Day",
    [LeaveDurationTypes.FULL_DAY]: "Full Day",
    [LeaveDurationTypes.HALF_AND_FULL_DAY]: "",
    [LeaveDurationTypes.NONE]: ""
  };

  return durationMapper[leaveType];
};

export const carryForwardKeyDownRestriction = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (
    !hasNumber().test(e.key) &&
    !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key) &&
    !(e.ctrlKey && ["a", "c", "v", "x"].includes(e.key))
  ) {
    e.preventDefault();
  }
};

export const carryForwardPasteRestriction = (
  e: React.ClipboardEvent<HTMLInputElement>
) => {
  if (!hasNumber().test(e.clipboardData.getData("Text"))) {
    e.preventDefault();
  }
};

export const getTruncatedLabel = (label: string) => {
  const truncatedLabel =
    label && label.toString().length > 10
      ? `${label.toString().slice(0, 6)}...`
      : label;

  return truncatedLabel;
};

export const getEmoji = (emojiCode: string) => {
  if (emojiCode.startsWith("&#")) {
    const codePoint = parseInt(
      emojiCode.replace("&#", "").replace(";", ""),
      10
    );
    if (isNaN(codePoint)) {
      return emojiCode;
    }
    return String.fromCodePoint(codePoint);
  } else {
    return emojiCode;
  }
};

export const getLeaveTypeDurationTableContent = (
  leaveDuration: LeaveDurationTypes
) => {
  switch (leaveDuration) {
    case LeaveDurationTypes.HALF_DAY:
      return ["Half Day"];
    case LeaveDurationTypes.FULL_DAY:
      return ["Full Day"];
    case LeaveDurationTypes.HALF_AND_FULL_DAY:
      return ["Full Day", "Half Day"];
    case LeaveDurationTypes.NONE:
      return [];
    default:
      return [];
  }
};

export const handleLeaveDurationClick = (
  values: Record<string, any>,
  selectedDuration: LeaveDurationTypes,
  setFieldValue: (field: string, value: any) => void,
  setFieldError: (field: string, value: string) => void
) => {
  let updatedDuration = LeaveDurationTypes.NONE;

  if (values.leaveDuration === LeaveDurationTypes.NONE) {
    updatedDuration = selectedDuration;
  } else if (selectedDuration === values.leaveDuration) {
    updatedDuration = LeaveDurationTypes.NONE;
  } else if (values.leaveDuration === LeaveDurationTypes.HALF_AND_FULL_DAY) {
    updatedDuration =
      selectedDuration === LeaveDurationTypes.HALF_DAY
        ? LeaveDurationTypes.FULL_DAY
        : LeaveDurationTypes.HALF_DAY;
  } else if (
    values.leaveDuration === LeaveDurationTypes.HALF_DAY ||
    values.leaveDuration === LeaveDurationTypes.FULL_DAY
  ) {
    updatedDuration = LeaveDurationTypes.HALF_AND_FULL_DAY;
  }

  setFieldValue("leaveDuration", updatedDuration);
  setFieldError("leaveDuration", "");
};

export const handleColorClick = ({
  color,
  colors,
  setColors,
  setFieldValue,
  setFieldError
}: {
  color: string;
  colors: string[];
  setColors: (value: React.SetStateAction<string[]>) => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, value: string) => void;
}): void => {
  setColors(colors);
  setFieldValue("colorCode", color);
  setFieldError("colorCode", "");
};

export const getIsActiveFieldDirtyStatus = (
  editingLeaveType: LeaveTypeType,
  allLeaveTypes: LeaveTypeType[]
) => {
  return (
    allLeaveTypes.find(
      (leaveType) => leaveType.typeId === editingLeaveType.typeId
    )?.isActive !== editingLeaveType.isActive
  );
};
