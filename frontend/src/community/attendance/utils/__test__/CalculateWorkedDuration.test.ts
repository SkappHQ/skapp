import {
  AttendanceSlotType,
  attendanceStatusTypes
} from "~community/attendance/types/attendanceTypes";

import {
  calculateWorkedDuration,
  calculateWorkedDurationInHoursAndMinutes
} from "../CalculateWorkedDuration";

beforeAll(() => {
  jest.useFakeTimers({ now: Date.now() });
});

afterAll(() => {
  jest.useRealTimers();
});

describe("calculateWorkedDuration", () => {
  test("calculates duration for START slot type", () => {
    jest.setSystemTime(new Date("2023-11-03T10:00:00Z").getTime());
    const attendanceParams: attendanceStatusTypes = {
      slotType: AttendanceSlotType.START,
      slotStartTime: "2023-11-03T08:00:00",
      workHours: 1,
      breakHours: 0
    };
    const result = calculateWorkedDuration(attendanceParams);
    expect(result).toBe(3 * 3600);
  });

  test("calculates duration for RESUME slot type", () => {
    jest.setSystemTime(new Date("2023-11-03T12:00:00Z").getTime());
    const attendanceParams: attendanceStatusTypes = {
      slotType: AttendanceSlotType.RESUME,
      slotStartTime: "2023-11-03T10:00:00",
      workHours: 0.5,
      breakHours: 0
    };
    const result = calculateWorkedDuration(attendanceParams);
    expect(result).toBe(2.5 * 3600);
  });

  test("calculates duration for END slot type", () => {
    jest.setSystemTime(new Date("2023-11-03T15:00:00Z").getTime());
    const attendanceParams: attendanceStatusTypes = {
      slotType: AttendanceSlotType.END,
      slotStartTime: "2023-11-03T09:00:00",
      workHours: 3,
      breakHours: 0
    };
    const result = calculateWorkedDuration(attendanceParams);
    expect(result).toBe(9 * 3600);
  });

  test("calculates duration for PAUSE slot type", () => {
    const attendanceParams: attendanceStatusTypes = {
      slotType: AttendanceSlotType.PAUSE,
      slotStartTime: "2023-11-03T10:00:00",
      workHours: 2,
      breakHours: 0
    };
    const result = calculateWorkedDuration(attendanceParams);
    expect(result).toBe(2 * 3600);
  });

  test("returns 0 for unsupported slot type", () => {
    const attendanceParams: attendanceStatusTypes = {
      slotType: "UNKNOWN" as AttendanceSlotType,
      slotStartTime: "2023-11-03T10:00:00",
      workHours: 2,
      breakHours: 0
    };
    const result = calculateWorkedDuration(attendanceParams);
    expect(result).toBe(0);
  });
});

describe("calculateWorkedDurationInHoursAndMinutes", () => {
  test("converts seconds to hours and minutes", () => {
    expect(calculateWorkedDurationInHoursAndMinutes(7260)).toBe("2h 1m");
  });

  test("returns correct format for exact hours", () => {
    expect(calculateWorkedDurationInHoursAndMinutes(7200)).toBe("2h 0m");
  });

  test("returns correct format for less than an hour", () => {
    expect(calculateWorkedDurationInHoursAndMinutes(1800)).toBe("0h 30m");
  });
});
