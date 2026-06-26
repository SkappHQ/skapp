import { DateTime } from "luxon";

import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  getHolidaysForDay,
  getHolidaysWithinDateRange,
  getLeaveRequestsWithinDateRange,
  getMyLeaveRequestForDay,
  handleDateChange,
  handleDateValidation,
  isNotAWorkingDate
} from "~community/common/utils/calendarDateRangePickerUtils";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { MyRequestsToastMsgKeyEnums } from "~community/leave/enums/ToastMsgKeyEnums";

import {
  allHolidays,
  endDate,
  myLeaveRequests,
  nonWorkingDate,
  selectedDates,
  selectedDatesTwo,
  startDate,
  workingDate,
  workingDays
} from "./calendarDateRangePickerMockData";

describe("calendarDateRangePickerUtils", () => {
  describe("isNotAWorkingDate", () => {
    it("should return true if the date is not a working day", () => {
      const result = isNotAWorkingDate({
        date: nonWorkingDate,
        workingDays
      });
      expect(result).toBe(true);
    });

    it("should return false if the date is a working day", () => {
      const result = isNotAWorkingDate({
        date: workingDate,
        workingDays
      });
      expect(result).toBe(false);
    });

    it("should return false if workingDays is undefined", () => {
      const result = isNotAWorkingDate({
        date: workingDate,
        workingDays: undefined
      });
      expect(result).toBe(false);
    });
  });

  describe("getMyLeaveRequestForDay", () => {
    it("should return the leave request for the given date", () => {
      const result = getMyLeaveRequestForDay({
        myLeaveRequests,
        date: startDate
      });
      expect(result).toEqual([myLeaveRequests[0]]);
    });

    it("should return null if no leave request is found for the given date", () => {
      const result = getMyLeaveRequestForDay({
        myLeaveRequests,
        date: workingDate
      });
      expect(result).toStrictEqual([]);
    });

    it("should return null if myLeaveRequests is undefined", () => {
      const result = getMyLeaveRequestForDay({
        myLeaveRequests: undefined,
        date: startDate
      });
      expect(result).toBe(null);
    });

    it("should return null if date is null", () => {
      const result = getMyLeaveRequestForDay({
        myLeaveRequests,
        date: null as unknown as DateTime
      });
      expect(result).toStrictEqual([]);
    });
  });

  describe("handleDateChange", () => {
    it("should set the selected date for single date picker", () => {
      const selectedDates: DateTime[] = [];
      const setSelectedDates = jest.fn();
      handleDateChange({
        date: workingDate,
        isRangePicker: false,
        selectedDates,
        setSelectedDates
      });
      expect(setSelectedDates).toHaveBeenCalledWith([workingDate]);
    });

    it("should set the selected date range for range picker", () => {
      const selectedDates: DateTime[] = [startDate];
      const setSelectedDates = jest.fn();
      handleDateChange({
        date: endDate,
        isRangePicker: true,
        selectedDates,
        setSelectedDates
      });
      expect(setSelectedDates).toHaveBeenCalledWith([startDate, endDate]);
    });

    it("should do nothing if date is null", () => {
      const selectedDates: DateTime[] = [];
      const setSelectedDates = jest.fn();
      handleDateChange({
        date: null,
        isRangePicker: false,
        selectedDates,
        setSelectedDates
      });
      expect(setSelectedDates).not.toHaveBeenCalled();
    });

    it("should reset selected dates if range picker and selectedDates has more than 2 dates", () => {
      const selectedDates: DateTime[] = [startDate, endDate, workingDate];
      const setSelectedDates = jest.fn();
      handleDateChange({
        date: workingDate,
        isRangePicker: true,
        selectedDates,
        setSelectedDates
      });
      expect(setSelectedDates).toHaveBeenCalledWith([workingDate]);
    });

    it("should set the selected date if selectedDates has no items", () => {
      const selectedDates: DateTime[] = [];
      const setSelectedDates = jest.fn();
      handleDateChange({
        date: workingDate,
        isRangePicker: true,
        selectedDates,
        setSelectedDates
      });
      expect(setSelectedDates).toHaveBeenCalledWith([workingDate]);
    });
  });

  describe("handleDateValidation", () => {
    it("should show error toast if more than one date is selected for half-day leave", () => {
      const setToastMessage = jest.fn();
      const translateText = jest.fn().mockReturnValue("Error");
      handleDateValidation({
        allowedDuration: LeaveDurationTypes.HALF_DAY,
        selectedDates,
        allHolidays: undefined,
        myLeaveRequests: undefined,
        setToastMessage,
        translateText
      });
      expect(setToastMessage).toHaveBeenCalledWith({
        key: MyRequestsToastMsgKeyEnums.ONLY_HALF_DAY_LEAVE_ALLOWED,
        open: true,
        toastType: ToastType.ERROR,
        title: "Error",
        description: "Error"
      });
    });

    it("should not disable the button if no holidays or leave requests exist", () => {
      const setToastMessage = jest.fn();
      const translateText = jest.fn();
      const setIsApplyLeaveModalBtnDisabled = jest.fn();
      handleDateValidation({
        allowedDuration: LeaveDurationTypes.FULL_DAY,
        selectedDates,
        allHolidays: [],
        myLeaveRequests: [],
        setToastMessage,
        translateText,
        setIsApplyLeaveModalBtnDisabled
      });
      expect(setIsApplyLeaveModalBtnDisabled).toHaveBeenCalledWith(false);
    });

    it("should disable the button if selected dates overlap with holidays", () => {
      const setToastMessage = jest.fn();
      const translateText = jest.fn().mockReturnValue("Holiday Error");
      const setIsApplyLeaveModalBtnDisabled = jest.fn();
      handleDateValidation({
        allowedDuration: LeaveDurationTypes.FULL_DAY,
        selectedDates,
        allHolidays,
        myLeaveRequests: [],
        setToastMessage,
        translateText,
        setIsApplyLeaveModalBtnDisabled
      });
      expect(setIsApplyLeaveModalBtnDisabled).toHaveBeenCalledWith(false);
    });
  });

  describe("getHolidaysForDay", () => {
    it("should return holiday data for the given date", () => {
      const result = getHolidaysForDay({
        allHolidays,
        date: workingDate
      });
      expect(result).toEqual([allHolidays[0]]);
    });

    it("should return null if no holiday data is found for the given date", () => {
      const result = getHolidaysForDay({
        allHolidays,
        date: nonWorkingDate
      });
      expect(result).toEqual([]);
    });

    it("should return null if allHolidays is undefined", () => {
      const result = getHolidaysForDay({
        allHolidays: undefined,
        date: workingDate
      });
      expect(result).toBe(null);
    });

    it("should return an empty array if date is null", () => {
      const result = getHolidaysForDay({
        allHolidays,
        date: null as unknown as DateTime
      });
      expect(result).toEqual([]);
    });
  });

  describe("getHolidaysWithinDateRange", () => {
    it("should return holidays within the selected date range", () => {
      const result = getHolidaysWithinDateRange({
        selectedDates: selectedDatesTwo,
        allHolidays
      });
      expect(result).toEqual(allHolidays);
    });

    it("should return an empty array if no holidays are found within the selected date range", () => {
      const result = getHolidaysWithinDateRange({
        selectedDates,
        allHolidays
      });
      expect(result).toEqual([]);
    });

    it("should return an empty array if allHolidays is undefined", () => {
      const result = getHolidaysWithinDateRange({
        selectedDates,
        allHolidays: undefined
      });
      expect(result).toEqual([]);
    });

    it("should return an empty array if selectedDates is empty", () => {
      const result = getHolidaysWithinDateRange({
        selectedDates: [],
        allHolidays
      });
      expect(result).toEqual([]);
    });
  });

  describe("getLeaveRequestsWithinDateRange", () => {
    it("should return leave requests within the selected date range", () => {
      const result = getLeaveRequestsWithinDateRange({
        selectedDates,
        myLeaveRequests
      });
      expect(result).toEqual([myLeaveRequests[0]]);
    });

    it("should return an empty array if no leave requests are found within the selected date range", () => {
      const result = getLeaveRequestsWithinDateRange({
        selectedDates: selectedDatesTwo,
        myLeaveRequests
      });
      expect(result).toEqual([]);
    });

    it("should return an empty array if myLeaveRequests is undefined", () => {
      const result = getLeaveRequestsWithinDateRange({
        selectedDates,
        myLeaveRequests: undefined
      });
      expect(result).toEqual([]);
    });

    it("should return an empty array if selectedDates is empty", () => {
      const result = getLeaveRequestsWithinDateRange({
        selectedDates: [],
        myLeaveRequests
      });
      expect(result).toEqual([]);
    });
  });
});
