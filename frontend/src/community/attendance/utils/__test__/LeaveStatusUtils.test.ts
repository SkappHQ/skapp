import { leaveDurationTypes } from "~community/attendance/types/attendanceTypes";
import { daysTypes } from "~community/common/constants/stringConstants";
import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";

import { getLeaveDuration, isLeaveApplicable } from "../LeaveStatusUtils";

const timeConfigData: DefaultDayCapacityType = {
  id: 1,
  startTime: "09:00",
  totalHours: 8,
  day: daysTypes.MONDAY,
  timeBlocks: [
    { hours: 4, timeBlock: "Morning Shift" },
    { hours: 4, timeBlock: "Afternoon Shift" }
  ]
};

describe("getLeaveDuration", () => {
  test("returns 'Full Day' for FULL DAY type", () => {
    expect(getLeaveDuration(leaveDurationTypes.FULL_DAY)).toBe("Full Day");
  });

  test("returns 'Half Day - Morning' for HALF DAY MORNING type", () => {
    expect(getLeaveDuration(leaveDurationTypes.HALF_DAY_MORNING)).toBe(
      "Half Day - Morning"
    );
  });

  test("returns 'Half Day - Evening' for HALFDAYEVENING type", () => {
    expect(getLeaveDuration(leaveDurationTypes.HALF_DAY_EVENING)).toBe(
      "Half Day - Evening"
    );
  });

  test("returns the leaveTypeName if it doesn't match known types", () => {
    expect(getLeaveDuration("CustomLeave")).toBe("CustomLeave");
  });
});

describe("isLeaveApplicable", () => {
  test("returns true for full day leave", () => {
    expect(isLeaveApplicable("Full Day", 10, timeConfigData)).toBe(true);
  });

  test("returns true for half day leave in the morning within morning hours", () => {
    expect(isLeaveApplicable("Half Day - Morning", 9, timeConfigData)).toBe(
      true
    );
  });

  test("returns false for half day leave in the morning outside morning hours", () => {
    expect(isLeaveApplicable("Half Day - Morning", 13, timeConfigData)).toBe(
      false
    );
  });

  test("returns true for half day leave in the evening within afternoon hours", () => {
    expect(isLeaveApplicable("Half Day - Evening", 15, timeConfigData)).toBe(
      true
    );
  });

  test("returns false if timeConfigData is not provided", () => {
    expect(isLeaveApplicable("Half Day - Morning", 9, undefined as any)).toBe(
      false
    );
  });
});
