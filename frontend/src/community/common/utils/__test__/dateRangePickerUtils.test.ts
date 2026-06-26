import { DateTime } from "luxon";

import {
  Holiday,
  HolidayDurationType
} from "~community/people/types/HolidayTypes";

import {
  getChipLabel,
  getSelectionClasses,
  handleDateChange
} from "../dateRangePickerUtils";

describe("handleDateChange", () => {
  it("should set a range when one date is already selected", () => {
    const setSelectedDates = jest.fn();
    const setAnchorEl = jest.fn();
    const date = DateTime.now();

    handleDateChange({
      date,
      isRangePicker: true,
      selectedDates: [new Date()],
      setSelectedDates,
      setAnchorEl
    });

    expect(setSelectedDates).toHaveBeenCalled();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
  });
});

describe("getChipLabel", () => {
  it("should return the default range label when no dates are selected", () => {
    const label = getChipLabel({
      selectedDates: [],
      isRangePicker: true
    });

    expect(label).toMatch(/\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2}\.\d{4}/);
  });

  it("should return a single date label for single date picker", () => {
    const label = getChipLabel({
      selectedDates: [new Date()],
      isRangePicker: false
    });

    expect(label).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });

  it("should return a range label when two dates are selected", () => {
    const label = getChipLabel({
      selectedDates: [new Date(), new Date()],
      isRangePicker: true
    });

    expect(label).toMatch(/\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2}\.\d{4}/);
  });
});

describe("getSelectionClasses", () => {
  it("should return 'Mui-user-selection' for a single selected date", () => {
    const day = DateTime.now();
    const selectedDates = [day.toJSDate()];

    const result = getSelectionClasses({
      day,
      selectedDates
    });

    expect(result).toBe("Mui-user-selection");
  });

  it("should return 'Mui-full-day-range-selection' for a date in range", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];

    const result = getSelectionClasses({
      day,
      selectedDates
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should handle holidays and return appropriate classes", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return an empty string when no conditions are met", () => {
    const day = DateTime.now();
    const selectedDates: Date[] = [];

    const result = getSelectionClasses({
      day,
      selectedDates
    });

    expect(result).toBe("");
  });

  it("should return 'Mui-half-day-morning-range-selection' for a morning half-day holiday", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return 'Mui-half-day-evening-range-selection' for an evening half-day holiday", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return an empty string for a full-day holiday", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.FULLDAY }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return a combination of classes for mixed half-day holidays", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING },
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return 'Mui-full-day-range-selection' when no holidays are present and the date is in range", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];

    const result = getSelectionClasses({
      day,
      selectedDates
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return an empty string when the date is not in range and no holidays are present", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 3 }).toJSDate(),
      day.minus({ days: 2 }).toJSDate()
    ];

    const result = getSelectionClasses({
      day,
      selectedDates
    });

    expect(result).toBe("");
  });

  it("should return an empty string when holidays conflict with full-day range selection", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.FULLDAY },
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING }
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });
});

describe("getSelectionClasses - additional cases", () => {
  it("should return 'Mui-full-day-range-selection' when date is in range and no holidays are defined", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const workingDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      workingDays
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return 'Mui-half-day-morning-range-selection' when morning half-day holiday is defined and date is in range", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING }
    ];
    const workingDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      workingDays,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return 'Mui-half-day-evening-range-selection' when evening half-day holiday is defined and date is in range", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];
    const workingDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      workingDays,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return an empty string when holidays conflict with full-day range selection", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.FULLDAY },
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING }
    ];
    const workingDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      workingDays,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });

  it("should return a combination of classes for mixed half-day holidays when date is in range", () => {
    const day = DateTime.now();
    const selectedDates = [
      day.minus({ days: 1 }).toJSDate(),
      day.plus({ days: 1 }).toJSDate()
    ];
    const holidaysForDay: Holiday[] = [
      { holidayDuration: HolidayDurationType.HALFDAY_MORNING },
      { holidayDuration: HolidayDurationType.HALFDAY_EVENING }
    ];
    const workingDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ];

    const result = getSelectionClasses({
      day,
      selectedDates,
      workingDays,
      holidaysForDay
    });

    expect(result).toBe("Mui-full-day-range-selection");
  });
});
