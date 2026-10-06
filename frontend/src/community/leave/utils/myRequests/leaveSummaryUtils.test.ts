import { LeaveStates } from "~community/common/types/CommonTypes";

import {
  calculateWorkingDays,
  getDefaultDurationText,
  getDuration,
  getLeavePeriod
} from "./leaveSummaryUtils";
import {
  createMockResourceAvailability,
  mockDateTimes,
  mockTranslateText,
  mockWorkingDays
} from "./mockData/leaveSummaryMockData";

describe("getDuration", () => {
  it("should return default duration text when no end date is provided", () => {
    const result = getDuration({
      leaveState: LeaveStates.FULL_DAY,
      translateText: mockTranslateText,
      workingDays: mockWorkingDays,
      resourceAvailability: [],
      startDate: mockDateTimes.singleDate
    });

    expect(result).toBe("Full Day");
  });

  it("should return 'Full Day' for single day full-day leave", () => {
    const resourceAvailability = createMockResourceAvailability(["25 Mar"]);

    const result = getDuration({
      leaveState: LeaveStates.FULL_DAY,
      translateText: mockTranslateText,
      workingDays: mockWorkingDays,
      resourceAvailability,
      startDate: mockDateTimes.singleDate,
      endDate: mockDateTimes.singleDate
    });

    expect(result).toBe("Full Day");
  });

  it("should return 'Morning' for half-day morning leave", () => {
    const resourceAvailability = createMockResourceAvailability(["25 Mar"]);

    const result = getDuration({
      leaveState: LeaveStates.MORNING,
      translateText: mockTranslateText,
      workingDays: mockWorkingDays,
      resourceAvailability,
      startDate: mockDateTimes.singleDate,
      endDate: mockDateTimes.singleDate
    });

    expect(result).toBe("Morning");
  });

  // it("should return number of days for multi-day leave", () => {
  //   const resourceAvailability = createMockResourceAvailability([
  //     "25 Mar",
  //     "26 Mar",
  //     "27 Mar"
  //   ]);

  //   const result = getDuration({
  //     leaveState: LeaveStates.FULL_DAY,
  //     translateText: mockTranslateText,
  //     workingDays: mockWorkingDays,
  //     resourceAvailability,
  //     startDate: mockDateTimes.startDate,
  //     endDate: mockDateTimes.endDate
  //   });

  //   expect(result).toBe("3 days");
  // });

  // it("should exclude holidays from working days count", () => {
  //   const resourceAvailability = mockResourceAvailabilityWithHoliday;

  //   const result = getDuration({
  //     leaveState: LeaveStates.FULL_DAY,
  //     translateText: mockTranslateText,
  //     workingDays: mockWorkingDays,
  //     resourceAvailability,
  //     startDate: mockDateTimes.startDate,
  //     endDate: mockDateTimes.endDate
  //   });

  //   expect(result).toBe("2 days");
  // });

  it("should handle empty resource availability", () => {
    const result = getDuration({
      leaveState: LeaveStates.FULL_DAY,
      translateText: mockTranslateText,
      workingDays: mockWorkingDays,
      resourceAvailability: undefined,
      startDate: mockDateTimes.startDate,
      endDate: mockDateTimes.endDate
    });

    expect(result).toBe("Full Day");
  });

  it("should exclude non-working weekend days", () => {
    const resourceAvailability = createMockResourceAvailability([
      "23 Mar", // Saturday
      "25 Mar" // Monday
    ]);

    const result = getDuration({
      leaveState: LeaveStates.FULL_DAY,
      translateText: mockTranslateText,
      workingDays: mockWorkingDays,
      resourceAvailability,
      startDate: mockDateTimes.weekendDate,
      endDate: mockDateTimes.singleDate
    });

    expect(result).toBe("Full Day");
  });
});

describe("getDefaultDurationText", () => {
  it("should return correct text for full day leave", () => {
    const result = getDefaultDurationText(
      LeaveStates.FULL_DAY,
      mockTranslateText
    );
    expect(result).toBe("Full Day");
  });

  it("should return correct text for morning leave", () => {
    const result = getDefaultDurationText(
      LeaveStates.MORNING,
      mockTranslateText
    );
    expect(result).toBe("Morning");
  });

  it("should return correct text for evening leave", () => {
    const result = getDefaultDurationText(
      LeaveStates.EVENING,
      mockTranslateText
    );
    expect(result).toBe("Evening");
  });
});

describe("getLeavePeriod", () => {
  it("should return formatted single date when no end date provided", () => {
    const result = getLeavePeriod(mockDateTimes.singleDate);
    expect(result).toBe("25th Mar");
  });

  it("should return formatted date range when end date is provided", () => {
    const result = getLeavePeriod(
      mockDateTimes.startDate,
      mockDateTimes.endDate
    );
    expect(result).toBe("25th Mar - 27th Mar");
  });
});

describe("calculateWorkingDays", () => {
  it("should return 0 when resource availability is undefined", () => {
    const result = calculateWorkingDays({
      workingDays: mockWorkingDays,
      resourceAvailability: undefined,
      startDate: mockDateTimes.startDate,
      endDate: mockDateTimes.endDate
    });

    expect(result).toBe(0);
  });

  // it("should count working days correctly", () => {
  //   const resourceAvailability = createMockResourceAvailability([
  //     "25 Mar",
  //     "26 Mar",
  //     "27 Mar"
  //   ]);

  //   const result = calculateWorkingDays({
  //     workingDays: mockWorkingDays,
  //     resourceAvailability,
  //     startDate: mockDateTimes.startDate,
  //     endDate: mockDateTimes.endDate
  //   });

  //   expect(result).toBe(3);
  // });

  // it("should exclude holidays from working days", () => {
  //   const resourceAvailability = mockResourceAvailabilityWithHoliday;

  //   const result = calculateWorkingDays({
  //     workingDays: mockWorkingDays,
  //     resourceAvailability,
  //     startDate: mockDateTimes.startDate,
  //     endDate: mockDateTimes.endDate
  //   });

  //   expect(result).toBe(2);
  // });
});
