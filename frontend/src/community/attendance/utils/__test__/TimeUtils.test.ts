import { DateTime } from "luxon";

import {
  addHoursToTime,
  convert24TimeTo12Hour,
  convertTo12HourByDateObject,
  convertTo12HourByDateString,
  convertTo24HourByDateString,
  convertToDateObjectBy12Hour,
  convertToDateTime,
  convertToMilliseconds,
  convertToTimeZoneISO,
  convertToUtc,
  convertUnixTimestampToISO,
  formatDuration,
  generateTimeSlots,
  getCurrentTimeZone,
  getDayStartTimeEndTime,
  getDuration,
  getTimeDifference,
  getTotalSlotTypeHours,
  isTimePm,
  isToday,
  sortTimeSlots,
  timeStringToDecimalHours,
  timeStringToSeconds
} from "../TimeUtils";

describe("Date and Time Utility Functions", () => {
  describe("convertTo24HourByDateString", () => {
    test("converts valid ISO date string to 24-hour format", () => {
      expect(convertTo24HourByDateString("2023-11-03T14:30:00")).toBe("14:30");
    });

    test("handles invalid date strings gracefully", () => {
      expect(convertTo24HourByDateString("invalid-date")).toBe(
        "Invalid DateTime"
      );
    });
  });

  test("convertUnixTimestampToISO", () => {
    const unixTimestamp = 1672444800000;
    const isoString = DateTime.fromMillis(unixTimestamp).toISO({
      includeOffset: false
    });
    expect(convertUnixTimestampToISO(unixTimestamp)).toBe(isoString);
  });

  test("generateTimeSlots", () => {
    const timeSlots = generateTimeSlots();
    expect(timeSlots.length).toBe(25);
    expect(timeSlots[0]).toBe("00:00");
    expect(timeSlots[24]).toBe("00:00");
  });

  test("timeStringToDecimalHours", () => {
    expect(timeStringToDecimalHours("02:30:00")).toBeCloseTo(2.5);
  });

  test("formatDuration", () => {
    expect(formatDuration(2.5)).toBe("2h 30m");
  });

  describe("isToday", () => {
    test("returns true for today's date (full ISO string)", () => {
      const todayISO = DateTime.local().toISO(); // Full ISO string with time
      expect(isToday(todayISO)).toBe(true);
    });

    test("returns true for today's date (YYYY-MM-DD format)", () => {
      const todayISODate = DateTime.local().toISODate(); // YYYY-MM-DD format
      expect(isToday(todayISODate)).toBe(true);
    });

    test("returns false for a past date", () => {
      expect(isToday("2000-01-01")).toBe(false);
    });

    test("returns false for a future date", () => {
      const futureDate = DateTime.local().plus({ days: 1 }).toISO(); // Tomorrow's date
      expect(isToday(futureDate)).toBe(false);
    });

    test("handles invalid date strings gracefully", () => {
      expect(isToday("invalid-date")).toBe(false); // Invalid input
    });
  });

  test("getDayStartTimeEndTime", () => {
    const { dayStart, dayEnd } = getDayStartTimeEndTime();
    const currentDay = DateTime.local().toISODate();
    expect(dayStart.startsWith(currentDay)).toBe(true);
    expect(dayEnd.startsWith(currentDay)).toBe(true);
  });

  test("timeStringToSeconds", () => {
    expect(timeStringToSeconds("01:30")).toBe(5400);
  });

  test("getTimeDifference", () => {
    const startTime = "2023-11-03T10:00:00";
    const endTime = "2023-11-03T12:00:00";
    expect(getTimeDifference(startTime, endTime)).toBe(7200);
  });

  describe("convertToUtc", () => {
    test("returns empty string when isoTime is null", () => {
      expect(convertToUtc(null)).toBe("");
    });

    test("converts local time to UTC", () => {
      const localTime = new Date(Date.UTC(2023, 10, 3, 12, 0, 0)).toISOString();
      expect(convertToUtc(localTime)).toBe("2023-11-03T12:00:00.000Z");
    });
  });

  test("convertToMilliseconds", () => {
    const timeString = "2023-11-03T12:00:00";
    const milliseconds = DateTime.fromISO(timeString, {
      zone: "Asia/Colombo"
    })
      .toUTC()
      .toMillis();

    expect(convertToMilliseconds(timeString)).toBe(milliseconds);
  });

  test("convertToDateTime", () => {
    const expectedDateTime = DateTime.fromFormat(
      "2023-11-03 12:00 PM",
      "yyyy-MM-dd hh:mm a",
      { zone: "Asia/Colombo" }
    ).toISO();

    const result = convertToDateTime("2023-11-03", "12:00 PM");
    expect(result).toBe(expectedDateTime);
  });

  test("convertToTimeZoneISO", () => {
    const isoTime = "2023-11-03T12:00:00Z";
    const expectedTime = DateTime.fromISO(isoTime)
      .setZone("Asia/Colombo")
      .toISO();
    expect(convertToTimeZoneISO(isoTime)).toBe(expectedTime);
  });

  describe("convertTo12HourByDateString", () => {
    test("converts ISO date string to 12-hour format", () => {
      expect(convertTo12HourByDateString("2023-11-03T14:30:00")).toBe(
        "02:30 PM"
      );
    });
  });

  describe("convert24TimeTo12Hour", () => {
    test("converts 24-hour time string to 12-hour format", () => {
      expect(convert24TimeTo12Hour("14:30")).toBe("02:30 PM");
    });
  });

  describe("addHoursToTime", () => {
    test("adds hours to a given time", () => {
      expect(addHoursToTime("2023-11-03T10:00:00", 2)).toBe("12:00 PM");
    });
  });

  describe("getTotalSlotTypeHours", () => {
    test("calculates total hours for a given slot type", () => {
      const timeSlots = [
        {
          startTime: "2023-11-03T10:00:00",
          endTime: "2023-11-03T11:00:00",
          slotType: "WORK",
          isManualEntry: false
        },
        {
          startTime: "2023-11-03T11:00:00",
          endTime: "2023-11-03T11:30:00",
          slotType: "BREAK",
          isManualEntry: false
        }
      ];
      expect(
        getTotalSlotTypeHours(timeSlots, "10:00 AM", "12:00 PM", "BREAK")
      ).toBe("00h 30m");
    });

    test("handles overnight durations correctly", () => {
      const timeSlots = [
        {
          startTime: "2023-11-03T22:00:00",
          endTime: "2023-11-04T02:00:00",
          slotType: "WORK",
          isManualEntry: false
        },
        {
          startTime: "2023-11-03T23:00:00",
          endTime: "2023-11-04T00:30:00",
          slotType: "BREAK",
          isManualEntry: false
        }
      ];
      expect(
        getTotalSlotTypeHours(timeSlots, "10:00 PM", "02:00 AM", "BREAK")
      ).toBe("01h 30m");
    });
  });

  describe("isTimePm", () => {
    test("returns true for PM times", () => {
      expect(isTimePm(new Date("2023-11-03T15:00:00"))).toBe(true);
    });

    test("returns false for AM times", () => {
      expect(isTimePm(new Date("2023-11-03T09:00:00"))).toBe(false);
    });
  });

  describe("convertToDateObjectBy12Hour", () => {
    test("converts 12-hour time string to Date object", () => {
      const dateObject = convertToDateObjectBy12Hour("02:30 PM");
      expect(dateObject.getHours()).toBe(14);
      expect(dateObject.getMinutes()).toBe(30);
    });
  });

  describe("convertTo12HourByDateObject", () => {
    test("converts Date object to 12-hour time string", () => {
      const date = new Date("2023-11-03T14:30:00");
      expect(convertTo12HourByDateObject(date)).toBe("02:30 PM");
    });

    test("handles midnight correctly", () => {
      const date = new Date("2023-11-03T00:00:00");
      expect(convertTo12HourByDateObject(date)).toBe("12:00 AM");
    });
  });

  describe("sortTimeSlots", () => {
    test("sorts time slots by start time", () => {
      const timeSlots = [
        {
          startTime: "2023-11-03T12:00:00",
          endTime: "2023-11-03T13:00:00",
          slotType: "DEFAULT",
          isManualEntry: false
        },
        {
          startTime: "2023-11-03T10:00:00",
          endTime: "2023-11-03T11:00:00",
          slotType: "DEFAULT",
          isManualEntry: false
        }
      ];
      const sortedSlots = sortTimeSlots(timeSlots);
      expect(sortedSlots[0].startTime).toBe("2023-11-03T10:00:00");
      expect(sortedSlots[1].startTime).toBe("2023-11-03T12:00:00");
    });
  });

  describe("getDuration", () => {
    test("calculates duration between two times", () => {
      expect(getDuration("10:00 AM", "12:30 PM")).toBe("02h 30m");
    });

    test("handles overnight durations", () => {
      expect(getDuration("10:00 PM", "02:00 AM")).toBe("-20h 00m");
    });
  });

  describe("getCurrentTimeZone", () => {
    test("returns the current time zone", () => {
      const timeZone = DateTime.local().zoneName;
      expect(getCurrentTimeZone()).toBe(timeZone);
    });
  });
});
