import { DateTime } from "luxon";

import { LeaveStates } from "~community/common/types/CommonTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import {
  getHolidayClasses,
  getLeaveRequestClasses
} from "../calendarDateRangePickerStyleUtils";

describe("getHolidayClasses", () => {
  it("should return 'Mui-full-day-holiday' for full-day holidays", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.FULLDAY }];
    expect(getHolidayClasses(holidays)).toBe("Mui-full-day-holiday");
  });

  it("should return combined classes for half-day holidays", () => {
    const holidays = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING },
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];
    expect(getHolidayClasses(holidays)).toBe("Mui-full-day-holiday");
  });

  it("should return empty string for no holidays", () => {
    expect(getHolidayClasses(null)).toBe("");
  });

  it("should return 'Mui-half-day-morning-holiday' for morning half-day holidays", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.HALFDAY_MORNING }];
    expect(getHolidayClasses(holidays)).toBe("Mui-half-day-morning-holiday");
  });

  it("should return 'Mui-half-day-evening-holiday' for evening half-day holidays", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.HALFDAY_EVENING }];
    expect(getHolidayClasses(holidays)).toBe("Mui-half-day-evening-holiday");
  });

  it("should return empty string for holidays with no duration", () => {
    const holidays = [{ holidayDuration: null }];
    expect(getHolidayClasses(holidays)).toBe("");
  });
});

describe("getLeaveRequestClasses", () => {
  const workingDays = ["2023-10-01", "2023-10-02"];
  const date = DateTime.fromISO("2023-10-01");

  it("should return 'Mui-full-day-leave' for full-day leave requests", () => {
    const leaveRequests = [{ leaveState: LeaveStates.FULL_DAY }];
    expect(
      getLeaveRequestClasses({
        leaveRequests,
        workingDays,
        date,
        holidays: null
      })
    ).toBe("");
  });

  it("should return combined classes for morning and evening leave requests", () => {
    const leaveRequests = [
      { leaveState: LeaveStates.MORNING },
      { leaveState: LeaveStates.EVENING }
    ];
    expect(
      getLeaveRequestClasses({
        leaveRequests,
        workingDays,
        date,
        holidays: null
      })
    ).toBe("");
  });

  it("should return holiday leave classes when holidays are present", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.HALFDAY_MORNING }];
    expect(
      getLeaveRequestClasses({ leaveRequests: [], workingDays, date, holidays })
    ).toBe("");
  });

  it("should return empty string for non-working dates", () => {
    const nonWorkingDate = DateTime.fromISO("2023-10-03");
    const leaveRequests = [{ leaveState: LeaveStates.FULL_DAY }];
    expect(
      getLeaveRequestClasses({
        leaveRequests,
        workingDays,
        date: nonWorkingDate,
        holidays: null
      })
    ).toBe("");
  });

  it("should return empty string for full-day holidays in leave requests", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.FULLDAY }];
    expect(
      getLeaveRequestClasses({ leaveRequests: [], workingDays, date, holidays })
    ).toBe("");
  });

  it("should return 'Mui-half-day-evening-leave' for morning half-day holidays", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.HALFDAY_MORNING }];
    expect(
      getLeaveRequestClasses({ leaveRequests: [], workingDays, date, holidays })
    ).toBe("");
  });

  it("should return 'Mui-half-day-morning-leave' for evening half-day holidays", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.HALFDAY_EVENING }];
    expect(
      getLeaveRequestClasses({ leaveRequests: [], workingDays, date, holidays })
    ).toBe("");
  });

  it("should return combined classes for both morning and evening half-day holidays", () => {
    const holidays = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING },
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];
    expect(
      getLeaveRequestClasses({ leaveRequests: [], workingDays, date, holidays })
    ).toBe("");
  });

  it("should return empty string for leave requests with no state", () => {
    const leaveRequests = [{ leaveState: null }];
    expect(
      getLeaveRequestClasses({
        leaveRequests,
        workingDays,
        date,
        holidays: null
      })
    ).toBe("");
  });

  it("should return empty string when both leave requests and holidays are empty", () => {
    expect(
      getLeaveRequestClasses({
        leaveRequests: [],
        workingDays,
        date,
        holidays: []
      })
    ).toBe("");
  });

  it("should return 'Mui-full-day-leave' when both morning and evening leave requests are present", () => {
    const leaveRequests = [
      { leaveState: LeaveStates.MORNING },
      { leaveState: LeaveStates.EVENING }
    ];
    expect(
      getLeaveRequestClasses({
        leaveRequests,
        workingDays,
        date,
        holidays: null
      })
    ).toBe("");
  });

  it("should prioritize holiday classes over leave request classes when both are present", () => {
    const holidays = [{ holidayDuration: HolidayDurationType.FULLDAY }];
    const leaveRequests = [{ leaveState: LeaveStates.FULL_DAY }];
    expect(
      getLeaveRequestClasses({ leaveRequests, workingDays, date, holidays })
    ).toBe("");
  });
});
