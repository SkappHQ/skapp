import { DateTime } from "luxon";

import { DayOfWeek } from "~community/common/enums/CommonEnums";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import {
  ResourceAvailabilityPayload,
  TeamAvailabilityDataType
} from "~community/leave/types/MyRequests";

import {
  getAvailabilityInfo,
  getEmployeesWithLeaveRequests,
  getTeamAvailabilityData,
  getTotalAvailableCount,
  getTotalLeaveCount
} from "./teamAvailabilityCardUtils";

const selectedDates = [DateTime.fromISO("2023-10-01")];

describe("getTotalLeaveCount", () => {
  it("should return total leave count", () => {
    const cardData: TeamAvailabilityDataType[] = [
      {
        date: "2023-10-01",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 2,
        availableCount: 3,
        employees: [],
        holidays: []
      }
    ];

    const result = getTotalLeaveCount(cardData);
    expect(result).toBe(2);
  });
});

describe("getTotalAvailableCount", () => {
  it("should return total available count", () => {
    const cardData: TeamAvailabilityDataType[] = [
      {
        date: "2023-10-01",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 2,
        availableCount: 3,
        employees: [],
        holidays: []
      }
    ];

    const result = getTotalAvailableCount(cardData);
    expect(result).toBe(3);
  });
});

describe("getEmployeesWithLeaveRequests", () => {
  it("should return unique employees with leave requests", () => {
    const cardData: TeamAvailabilityDataType[] = [
      {
        date: "2023-10-01",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 2,
        availableCount: 3,
        employees: [
          {
            firstName: "John",
            lastName: "Doe",
            image: "john.jpg",
            leaveState: LeaveStates.FULL_DAY
          },
          {
            firstName: "Jane",
            lastName: "Smith",
            image: "jane.jpg",
            leaveState: LeaveStates.FULL_DAY
          }
        ],
        holidays: []
      }
    ];

    const result = getEmployeesWithLeaveRequests(cardData);
    expect(result).toEqual([
      {
        firstName: "John",
        lastName: "Doe",
        image: "john.jpg",
        leaveState: LeaveStates.FULL_DAY
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        image: "jane.jpg",
        leaveState: LeaveStates.FULL_DAY
      }
    ]);
  });
});

describe("getAvailabilityInfo", () => {
  const translateText = jest.fn((key) => key.join(" "));

  it("should return info for single date", () => {
    const cardData: TeamAvailabilityDataType[] = [
      {
        date: "2023-10-01",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 2,
        availableCount: 3,
        employees: [
          {
            firstName: "John",
            lastName: "Doe",
            image: "john.jpg",
            leaveState: LeaveStates.FULL_DAY
          }
        ],
        holidays: []
      }
    ];

    const result = getAvailabilityInfo({
      selectedDates,
      cardData,
      translateText
    });

    expect(result).toBe("oneEmployeeAwayForSingleDate");
  });

  it("should return info for multiple dates", () => {
    const multipleDates = [
      DateTime.fromISO("2023-10-01"),
      DateTime.fromISO("2023-10-02")
    ];
    const cardData: TeamAvailabilityDataType[] = [
      {
        date: "2023-10-01",
        dayOfWeek: DayOfWeek.MON,
        leaveCount: 2,
        availableCount: 3,
        employees: [
          {
            firstName: "John",
            lastName: "Doe",
            image: "john.jpg",
            leaveState: LeaveStates.FULL_DAY
          },
          {
            firstName: "Jane",
            lastName: "Smith",
            image: "jane.jpg",
            leaveState: LeaveStates.FULL_DAY
          }
        ],
        holidays: []
      },
      {
        date: "2023-10-02",
        dayOfWeek: DayOfWeek.TUE,
        leaveCount: 1,
        availableCount: 4,
        employees: [
          {
            firstName: "John",
            lastName: "Doe",
            image: "john.jpg",
            leaveState: LeaveStates.FULL_DAY
          }
        ],
        holidays: []
      }
    ];

    const result = getAvailabilityInfo({
      selectedDates: multipleDates,
      cardData,
      translateText
    });

    expect(result).toBe("twoEmployeesAwayForMultipleDates");
  });
});

describe("getTeamAvailabilityData", () => {
  const mockResourceAvailability: ResourceAvailabilityPayload[] = [
    {
      date: "15 JAN",
      dayOfWeek: DayOfWeek.FRI,
      leaveCount: 1,
      availableCount: 2,
      leaveRequests: [
        {
          leaveRequestId: 20,
          leaveState: LeaveStates.FULL_DAY,
          status: LeaveStatusEnums.APPROVED,
          startDate: "2024-11-01",
          endDate: "2024-11-01",
          leaveType: {
            typeId: 4,
            name: "Paternity",
            emojiCode: "1f468-200d-1f37c",
            colorCode: "#658AFC"
          },
          employee: {
            employeeId: 2,
            firstName: "John",
            middleName: "Junior",
            lastName: "Doe",
            authPic: "string"
          },
          reviewer: {
            employeeId: 1,
            firstName: "Jane",
            middleName: "Junior",
            lastName: "Smith",
            authPic: "string"
          }
        }
      ],
      holidays: []
    },
    {
      date: "16 JAN",
      dayOfWeek: DayOfWeek.SAT,
      leaveCount: 0,
      availableCount: 3,
      leaveRequests: [],
      holidays: []
    },
    {
      date: "17 JAN",
      dayOfWeek: DayOfWeek.SUN,
      leaveCount: 0,
      availableCount: 3,
      leaveRequests: [],
      holidays: []
    }
  ];

  // Helper to create DateTime for current year
  const createDateTime = (dateString: string) => {
    const [day, month] = dateString.split(" ");
    return DateTime.now().set({
      year: DateTime.now().year,
      month: DateTime.fromFormat(month, "LLL").month,
      day: parseInt(day, 10),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    });
  };

  it("should return empty array when no resource availability", () => {
    const result = getTeamAvailabilityData({
      selectedDates: [],
      resourceAvailability: undefined
    });

    expect(result).toEqual([]);
  });

  it("should return data for a single selected date", () => {
    const singleDate = createDateTime("15 JAN");

    const result = getTeamAvailabilityData({
      selectedDates: [singleDate],
      resourceAvailability: mockResourceAvailability
    });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("15 JAN");
    expect(result[0].leaveCount).toBe(1);
    expect(result[0].availableCount).toBe(2);
    expect(result[0].employees).toHaveLength(1);
    expect(result[0].employees[0]).toEqual({
      firstName: "John",
      lastName: "Doe",
      image: "string",
      leaveState: LeaveStates.FULL_DAY
    });
  });

  it("should return data for a date range", () => {
    const startDate = createDateTime("15 JAN");
    const endDate = createDateTime("16 JAN");

    const result = getTeamAvailabilityData({
      selectedDates: [startDate, endDate],
      resourceAvailability: mockResourceAvailability
    });

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("15 JAN");
    expect(result[1].date).toBe("16 JAN");
  });

  it("should filter out dates outside the selected range", () => {
    const startDate = createDateTime("15 JAN");
    const endDate = createDateTime("15 JAN");

    const result = getTeamAvailabilityData({
      selectedDates: [startDate, endDate],
      resourceAvailability: mockResourceAvailability
    });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("15 JAN");
  });

  it("should handle an empty leaveRequests array", () => {
    const singleDate = createDateTime("17 Jan");

    const result = getTeamAvailabilityData({
      selectedDates: [singleDate],
      resourceAvailability: mockResourceAvailability
    });

    expect(result).toHaveLength(1);
    expect(result[0].employees).toHaveLength(0);
  });

  it("should return correct data structure", () => {
    const singleDate = createDateTime("15 JAN");

    const result = getTeamAvailabilityData({
      selectedDates: [singleDate],
      resourceAvailability: mockResourceAvailability
    });

    expect(result[0]).toEqual({
      date: "15 JAN",
      dayOfWeek: DayOfWeek.FRI,
      leaveCount: 1,
      availableCount: 2,
      employees: [
        {
          firstName: "John",
          lastName: "Doe",
          image: "string",
          leaveState: LeaveStates.FULL_DAY
        }
      ],
      holidays: []
    });
  });
});
