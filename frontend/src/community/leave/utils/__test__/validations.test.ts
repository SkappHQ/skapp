import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";

import {
  addEditCustomLeaveAllocationValidationSchema,
  addLeaveTypeValidationSchema,
  customLeaveAllocationValidation
} from "../validations";

const mockTranslateText = (keys: string[]) => keys[0];

describe("customLeaveAllocationValidation", () => {
  const schema = customLeaveAllocationValidation(mockTranslateText);

  it("should pass validation for a valid custom leave allocation", async () => {
    const validData = {
      name: "Annual Leave",
      numberOfDays: 5,
      type: "Paid"
    };
    await expect(schema.validate(validData)).resolves.toEqual(validData);
  });

  it("should fail when name is missing", async () => {
    const invalidData = {
      numberOfDays: 5,
      type: "Paid"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "leaveAllocationNameError"
    );
  });

  it("should fail when name exceeds max length", async () => {
    const invalidData = {
      name: "A".repeat(101),
      numberOfDays: 5,
      type: "Paid"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "leaveAllocationNameMaxLengthError"
    );
  });

  it("should fail when numberOfDays is below the minimum value (0.5)", async () => {
    const invalidData = {
      name: "Annual Leave",
      numberOfDays: 0.1,
      type: "Paid"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "validNoOfDaysRangeError"
    );
  });

  it("should fail when numberOfDays is above the maximum value (365)", async () => {
    const invalidData = {
      name: "Annual Leave",
      numberOfDays: 366,
      type: "Paid"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "validNoOfDaysRangeError"
    );
  });

  it("should fail when numberOfDays is not a valid fraction", async () => {
    const invalidData = {
      name: "Annual Leave",
      numberOfDays: 5.555,
      type: "Paid"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "invalidFractionPointError"
    );
  });

  it("should fail when type is missing", async () => {
    const invalidData = {
      name: "Annual Leave",
      numberOfDays: 5
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "CustomLeaveAllocationTypeError"
    );
  });
});

describe("addLeaveTypeValidationSchema", () => {
  const mockLeaveTypes: LeaveTypeType[] = [
    {
      typeId: 1,
      name: "Sick Leave",
      emojiCode: "😷",
      colorCode: "#FF0000",
      calculationType: "Standard",
      leaveDuration: LeaveDurationTypes.FULL_DAY,
      maxCarryForwardDays: 10,
      carryForwardExpirationDays: 180,
      carryForwardExpirationDate: "2024-12-31",
      isAttachment: false,
      isOverridden: false,
      isAttachmentMandatory: false,
      isCommentMandatory: false,
      isAutoApproval: false,
      isActive: true,
      isCarryForwardEnabled: true,
      isCarryForwardRemainingBalanceEnabled: true
    },
    {
      typeId: 2,
      name: "Annual Leave",
      emojiCode: "🏖️",
      colorCode: "#00FF00",
      calculationType: "Standard",
      leaveDuration: LeaveDurationTypes.FULL_DAY,
      maxCarryForwardDays: 15,
      carryForwardExpirationDays: 180,
      carryForwardExpirationDate: "2025-01-01",
      isAttachment: false,
      isOverridden: false,
      isAttachmentMandatory: false,
      isCommentMandatory: false,
      isAutoApproval: true,
      isActive: true,
      isCarryForwardEnabled: false,
      isCarryForwardRemainingBalanceEnabled: true
    }
  ];

  const schema = addLeaveTypeValidationSchema(
    mockLeaveTypes,
    mockTranslateText
  );

  it("should pass validation for a valid leave type", async () => {
    const validData = {
      name: "Sick Leave",
      emoji: "string",
      colorCode: "#FF0000",
      leaveDuration: "Full Day",
      isCarryForwardEnabled: true,
      maxCarryForwardDays: 10,
      carryForwardExpirationDate: "2025-01-01"
    };
    await expect(schema.validate(validData)).resolves.toEqual(validData);
  });

  it("should fail when name is too long", async () => {
    const invalidData = {
      name: "A".repeat(101),
      emojiCode: "string",
      colorCode: "#FF0000",
      leaveDuration: "Full Day"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyLeaveTypeEmojiError"
    );
  });

  it("should fail when name is not unique", async () => {
    const invalidData = {
      name: "Annual Leave",
      emojiCode: "string",
      colorCode: "#FF0000",
      leaveDuration: "Full Day"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyLeaveTypeEmojiError"
    );
  });

  it("should fail when emojiCode is missing", async () => {
    const invalidData = {
      name: "Personal Leave",
      colorCode: "#FF0000",
      leaveDuration: "Full Day"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyLeaveTypeEmojiError"
    );
  });

  it("should fail when colorCode is missing", async () => {
    const invalidData = {
      name: "Personal Leave",
      emojiCode: "💼",
      leaveDuration: "Full Day"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyLeaveTypeColorError"
    );
  });

  it("should fail when leaveDuration is 'NONE'", async () => {
    const invalidData = {
      name: "Personal Leave",
      emojiCode: "string",
      colorCode: "#FF0000",
      leaveDuration: LeaveDurationTypes.NONE
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyLeaveDurationError"
    );
  });

  it("should fail when maxCarryForwardDays is missing but carry forward is enabled", async () => {
    const invalidData = {
      name: "Sick Leave",
      emojiCode: "string",
      colorCode: "#FF0000",
      leaveDuration: "Full Day",
      isCarryForwardEnabled: true,
      carryForwardExpirationDate: "2025-01-01"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyMaxCarryForwardDaysError"
    );
  });

  it("should fail when carryForwardExpirationDate is missing but carry forward is enabled", async () => {
    const invalidData = {
      name: "Sick Leave",
      emojiCode: "string",
      colorCode: "#FF0000",
      leaveDuration: "Full Day",
      isCarryForwardEnabled: true,
      maxCarryForwardDays: 10
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "emptyCarryForwardExpirationDaysError"
    );
  });
});

describe("addEditCustomLeaveAllocationValidationSchema", () => {
  const schema =
    addEditCustomLeaveAllocationValidationSchema(mockTranslateText);

  it("should pass validation for a valid custom leave allocation edit", async () => {
    const validData = {
      name: "Personal Leave",
      type: "Unpaid",
      numberOfDays: 3
    };
    await expect(schema.validate(validData)).resolves.toBe(validData);
  });

  it("should fail when name is too short", async () => {
    const invalidData = {
      name: "A",
      type: "Unpaid",
      numberOfDays: 3
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "minEmployeeNameLengthError"
    );
  });

  it("should fail when numberOfDays is not an integer", async () => {
    const invalidData = {
      name: "Personal Leave",
      type: "Unpaid",
      numberOfDays: 3.5
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "integerNumberError"
    );
  });
});
