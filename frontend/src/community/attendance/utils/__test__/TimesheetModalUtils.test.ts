import { DateTime } from "luxon";

import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  TimeAvailabilityType,
  TimeEntryFormValueType
} from "~community/attendance/types/timeSheetTypes";

import { getModalBeforeManualEntry } from "../TimesheetModalUtils";

describe("Timesheet Modal Utility Functions", () => {
  describe("getModalBeforeManualEntry", () => {
    const noAvailability = {} as TimeAvailabilityType;

    const valuesFor = (timeEntryDate: string) =>
      ({ timeEntryDate }) as TimeEntryFormValueType;

    const today = DateTime.local().toFormat("yyyy-MM-dd");
    const pastDate = "2024-01-15";

    test("returns null when nothing blocks the entry", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          noAvailability,
          undefined
        )
      ).toBeNull();
    });

    test.each([
      AttendanceSlotType.START,
      AttendanceSlotType.PAUSE,
      AttendanceSlotType.RESUME
    ])("flags an ongoing session for slot type %s on today", (slotType) => {
      expect(
        getModalBeforeManualEntry(valuesFor(today), noAvailability, slotType)
      ).toBe(EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY);
    });

    test("ignores an ongoing session when the entry is not for today", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          noAvailability,
          AttendanceSlotType.START
        )
      ).toBeNull();
    });

    test("prefers an existing request over an existing time slot", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          {
            editTimeRequests: { timeRequestId: "1" },
            timeSlotsExists: true
          } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS);
    });

    test("detects a pending manual entry request", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          { manualEntryRequests: [{}] } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS);
    });

    test("detects an existing time slot", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          { timeSlotsExists: true } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS);
    });

    test("detects a leave request", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          { leaveRequest: [{}] } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY);
    });

    test("detects a holiday", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          { holiday: [{}] } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY);
    });

    test("prefers a leave request over a holiday", () => {
      expect(
        getModalBeforeManualEntry(
          valuesFor(pastDate),
          { leaveRequest: [{}], holiday: [{}] } as TimeAvailabilityType,
          undefined
        )
      ).toBe(EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY);
    });
  });
});
