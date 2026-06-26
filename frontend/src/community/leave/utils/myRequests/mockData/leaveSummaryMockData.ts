import { DateTime } from "luxon";

import { daysTypes } from "~community/common/constants/stringConstants";
import { DayOfWeek } from "~community/common/enums/CommonEnums";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

export const mockTranslateText = (keys: string[]) => {
  const translations: { [key: string]: string } = {
    fullDay: "Full Day",
    halfDayMorning: "Morning",
    halfDayEvening: "Evening",
    days: "days"
  };
  return translations[keys[0]] || "";
};

export const mockWorkingDays = [
  daysTypes.MONDAY,
  daysTypes.TUESDAY,
  daysTypes.WEDNESDAY,
  daysTypes.THURSDAY,
  daysTypes.FRIDAY
];

export const createMockResourceAvailability = (
  dates: string[],
  options: {
    withHolidays?: boolean;
    dayOfWeek?: DayOfWeek;
  } = {}
): ResourceAvailabilityPayload[] => {
  const { dayOfWeek = DayOfWeek.MON } = options;

  return dates.map((date) => ({
    date,
    dayOfWeek,
    leaveCount: 0,
    availableCount: 1,
    leaveRequests: [],
    holidays: []
  }));
};

export const mockDateTimes = {
  startDate: DateTime.fromISO("2024-03-25"),
  endDate: DateTime.fromISO("2024-03-27"),
  singleDate: DateTime.fromISO("2024-03-25"),
  weekendDate: DateTime.fromISO("2024-03-23") // Saturday
};

export const mockResourceAvailabilityWithHoliday: ResourceAvailabilityPayload[] =
  [
    {
      date: "25 Mar",
      dayOfWeek: DayOfWeek.MON,
      leaveCount: 0,
      availableCount: 1,
      leaveRequests: [],
      holidays: [
        {
          id: 1,
          name: "Public Holiday",
          holidayDuration: HolidayDurationType.FULLDAY
        }
      ]
    },
    {
      date: "26 Mar",
      dayOfWeek: DayOfWeek.TUE,
      leaveCount: 0,
      availableCount: 1,
      leaveRequests: [],
      holidays: []
    },
    {
      date: "27 Mar",
      dayOfWeek: DayOfWeek.WED,
      leaveCount: 0,
      availableCount: 1,
      leaveRequests: [],
      holidays: []
    }
  ];
