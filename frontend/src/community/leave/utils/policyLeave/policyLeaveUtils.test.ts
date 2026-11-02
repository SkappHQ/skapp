import { daysTypes } from "~community/common/constants/stringConstants";
import { DayOfWeek } from "~community/common/enums/CommonEnums";
import {
  LeaveRequestStates,
  LeaveStates
} from "~community/common/types/CommonTypes";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import { PolicyOnLeaveTodayStatus } from "~community/leave/enums/PolicyLeaveEnums";
import {
  PolicyEmployeesOnLeaveType,
  PolicyResourceAvailabilityDayType,
  PolicyResourceAvailabilityLeaveRequestType
} from "~community/leave/types/PolicyLeaveTypes";
import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import {
  getPolicyOnLeaveTodayStatus,
  getResourceAvailabilityCalendarRange,
  toResourceAvailabilityPayloads,
  toResourceAvailabilityRecords
} from "./policyLeaveUtils";

const buildOnLeaveToday = (
  overrides: Partial<PolicyEmployeesOnLeaveType> = {}
): PolicyEmployeesOnLeaveType => ({
  date: "2025-06-11",
  isNonWorkingDay: false,
  holidays: null,
  onLeaveCount: 2,
  onlineCount: 3,
  ...overrides
});

describe("getPolicyOnLeaveTodayStatus", () => {
  it("returns non-working day when today is a holiday or day off", () => {
    expect(
      getPolicyOnLeaveTodayStatus(
        buildOnLeaveToday({
          isNonWorkingDay: true,
          holidays: [
            {
              id: 1,
              date: "2025-06-11",
              name: "Founders Day",
              holidayDuration: HolidayDurationType.FULLDAY
            }
          ],
          onLeaveCount: null,
          onlineCount: null
        })
      )
    ).toBe(PolicyOnLeaveTodayStatus.NON_WORKING_DAY);
  });

  it("returns no employees when both counts are zero", () => {
    expect(
      getPolicyOnLeaveTodayStatus(
        buildOnLeaveToday({ onLeaveCount: 0, onlineCount: 0 })
      )
    ).toBe(PolicyOnLeaveTodayStatus.NO_EMPLOYEES);
  });

  it("returns all available when nobody is on leave", () => {
    expect(
      getPolicyOnLeaveTodayStatus(buildOnLeaveToday({ onLeaveCount: 0 }))
    ).toBe(PolicyOnLeaveTodayStatus.ALL_AVAILABLE);
  });

  it("returns all away when nobody is online", () => {
    expect(
      getPolicyOnLeaveTodayStatus(buildOnLeaveToday({ onlineCount: 0 }))
    ).toBe(PolicyOnLeaveTodayStatus.ALL_AWAY);
  });

  it("returns partially away when some are on leave and some online", () => {
    expect(getPolicyOnLeaveTodayStatus(buildOnLeaveToday())).toBe(
      PolicyOnLeaveTodayStatus.PARTIALLY_AWAY
    );
  });
});

const buildLeaveRequest = (
  overrides: Partial<PolicyResourceAvailabilityLeaveRequestType> = {}
): PolicyResourceAvailabilityLeaveRequestType => ({
  leaveRequestId: 972,
  employee: {
    employeeId: 3,
    firstName: "Jane",
    middleName: null,
    lastName: "Doe",
    authPic: null
  },
  policyName: "Annual Policy",
  leaveType: {
    id: 100,
    name: "Annual",
    emojiCode: "U+1F3D6",
    colorCode: "#FFC107",
    minDuration: LeaveDurationTypes.HALF_AND_FULL_DAY,
    isAttachment: false,
    isAttachmentMust: false,
    isCommentMust: false,
    isAutoApproval: false
  },
  startDate: "2026-11-02",
  endDate: "2026-11-04",
  leaveState: LeaveStates.FULL_DAY,
  ...overrides
});

const buildDay = (
  overrides: Partial<PolicyResourceAvailabilityDayType> = {}
): PolicyResourceAvailabilityDayType => ({
  date: "2026-11-02",
  dayOfWeek: daysTypes.MONDAY,
  isNonWorkingDay: false,
  holidays: [],
  leaveCount: 1,
  availableCount: 4,
  leaveRequests: [buildLeaveRequest()],
  ...overrides
});

const workingDays = [
  daysTypes.MONDAY,
  daysTypes.TUESDAY,
  daysTypes.WEDNESDAY,
  daysTypes.THURSDAY,
  daysTypes.FRIDAY
];

const weekendDay = buildDay({
  date: "2026-11-07",
  dayOfWeek: daysTypes.SATURDAY,
  isNonWorkingDay: true,
  holidays: [
    { id: null, date: "2026-11-07", name: "Day Off!", holidayDuration: null }
  ],
  leaveCount: 0,
  availableCount: 5,
  leaveRequests: []
});

const holiday = buildDay({
  date: "2026-11-03",
  dayOfWeek: daysTypes.TUESDAY,
  isNonWorkingDay: true,
  holidays: [
    {
      id: 7,
      date: "2026-11-03",
      name: "Founders Day",
      holidayDuration: HolidayDurationType.FULLDAY
    }
  ]
});

describe("getResourceAvailabilityCalendarRange", () => {
  it("spans from the Monday of the first week to the Sunday of the last week", () => {
    expect(getResourceAvailabilityCalendarRange(2026, 11)).toEqual({
      startDate: "2026-10-26",
      endDate: "2026-12-06"
    });
  });

  it("keeps the month boundaries when the month starts on a Monday and ends on a Sunday", () => {
    expect(getResourceAvailabilityCalendarRange(2027, 2)).toEqual({
      startDate: "2027-02-01",
      endDate: "2027-02-28"
    });
  });
});

describe("toResourceAvailabilityRecords", () => {
  it("maps a policy day to the calendar card shape", () => {
    expect(toResourceAvailabilityRecords([buildDay()], workingDays)).toEqual([
      {
        date: "2ND NOV",
        actualDate: "2026-11-02",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 1,
        availableCount: 4,
        holidays: [],
        leaveRequests: [
          {
            leaveRequestId: 972,
            leaveState: LeaveStates.FULL_DAY,
            status: LeaveRequestStates.APPROVED,
            startDate: "2026-11-02",
            endDate: "2026-11-04",
            leaveType: {
              typeId: 100,
              name: "Annual Policy",
              emojiCode: "U+1F3D6",
              colorCode: "#FFC107"
            },
            employee: {
              employeeId: 3,
              firstName: "Jane",
              middleName: null,
              lastName: "Doe",
              authPic: ""
            }
          }
        ]
      }
    ]);
  });

  it("drops non-working days but keeps holidays on working days", () => {
    const records = toResourceAvailabilityRecords(
      [buildDay(), holiday, weekendDay],
      workingDays
    );

    expect(records.map((record) => record.actualDate)).toEqual([
      "2026-11-02",
      "2026-11-03"
    ]);
    expect(records[1].holidays).toEqual([
      {
        id: "7",
        name: "Founders Day",
        holidayDuration: HolidayDurationType.FULLDAY
      }
    ]);
  });

  it("keeps every day when the working days are not loaded yet", () => {
    expect(
      toResourceAvailabilityRecords([buildDay(), weekendDay], [])
    ).toHaveLength(2);
  });

  it("formats the date label with the ordinal suffix", () => {
    const records = toResourceAvailabilityRecords(
      [
        buildDay({ date: "2026-11-11", dayOfWeek: daysTypes.WEDNESDAY }),
        buildDay({ date: "2026-12-23", dayOfWeek: daysTypes.WEDNESDAY })
      ],
      workingDays
    );

    expect(records.map((record) => record.date)).toEqual([
      "11TH NOV",
      "23RD DEC"
    ]);
  });
});

describe("toResourceAvailabilityPayloads", () => {
  it("maps a policy day to the apply leave modal shape", () => {
    expect(toResourceAvailabilityPayloads([holiday], workingDays)).toEqual([
      {
        date: "3RD NOV",
        dayOfWeek: DayOfWeek.TUE,
        leaveCount: 1,
        availableCount: 4,
        holidays: [
          {
            id: 7,
            name: "Founders Day",
            holidayDuration: HolidayDurationType.FULLDAY
          }
        ],
        leaveRequests: [
          {
            leaveRequestId: 972,
            leaveState: LeaveStates.FULL_DAY,
            status: LeaveStatusEnums.APPROVED,
            startDate: "2026-11-02",
            endDate: "2026-11-04",
            leaveType: {
              typeId: 100,
              name: "Annual Policy",
              emojiCode: "U+1F3D6",
              colorCode: "#FFC107"
            },
            reviewer: null,
            employee: {
              employeeId: 3,
              firstName: "Jane",
              middleName: "",
              lastName: "Doe",
              authPic: ""
            }
          }
        ]
      }
    ]);
  });

  it("drops non-working days", () => {
    expect(
      toResourceAvailabilityPayloads([buildDay(), weekendDay], workingDays)
    ).toHaveLength(1);
  });
});
