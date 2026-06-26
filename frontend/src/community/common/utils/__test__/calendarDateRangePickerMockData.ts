import { DateTime } from "luxon";

import { LeaveStates } from "~community/common/types/CommonTypes";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

export const workingDate: DateTime = DateTime.fromISO("2024-04-01");

export const nonWorkingDate: DateTime = DateTime.fromISO("2024-04-06");

export const startDate: DateTime = DateTime.fromISO("2024-04-08");

export const endDate: DateTime = DateTime.fromISO("2024-04-10");

export const selectedDates: DateTime[] = [startDate, endDate];

export const DateOne: DateTime = DateTime.fromISO("2024-04-01");

export const DateTwo: DateTime = DateTime.fromISO("2024-04-02");

export const selectedDatesTwo: DateTime[] = [DateOne, DateTwo];

export const workingDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY"
];

export const myLeaveRequests: MyLeaveRequestPayloadType[] = [
  {
    leaveRequestId: 1,
    startDate: "2024-04-08",
    endDate: "2024-04-10",
    leaveType: {
      typeId: 1,
      name: "Annual Leave",
      emojiCode: "🏖️",
      colorCode: "#4CAF50"
    },
    leaveState: LeaveStates.FULL_DAY,
    status: LeaveStatusEnums.APPROVED,
    durationHours: 24,
    isViewed: true,
    durationDays: 3,
    requestDesc: "Summer vacation trip"
  },
  {
    leaveRequestId: 2,
    startDate: "2024-04-15",
    endDate: "2024-04-17",
    leaveType: {
      typeId: 2,
      name: "Sick Leave",
      emojiCode: "🤒",
      colorCode: "#FF5722"
    },
    leaveState: LeaveStates.MORNING,
    status: LeaveStatusEnums.PENDING,
    durationHours: 4,
    isViewed: false,
    durationDays: 0.5,
    requestDesc: "Medical consultation"
  },
  {
    leaveRequestId: 3,
    startDate: "2024-05-10",
    endDate: "2024-05-10",
    leaveType: {
      typeId: 3,
      name: "Personal Leave",
      emojiCode: "🏡",
      colorCode: "#2196F3"
    },
    leaveState: LeaveStates.EVENING,
    status: LeaveStatusEnums.DENIED,
    durationHours: 4,
    isViewed: true,
    durationDays: 0.5,
    requestDesc: "Family event"
  }
];

export const allHolidays: Holiday[] = [
  {
    id: 1,
    date: "2024-04-01",
    name: "Independence Day",
    holidayDuration: HolidayDurationType.FULLDAY
  },
  {
    id: 2,
    date: "2024-04-02",
    name: "Spring Festival",
    holidayDuration: HolidayDurationType.HALFDAY_MORNING
  }
];
