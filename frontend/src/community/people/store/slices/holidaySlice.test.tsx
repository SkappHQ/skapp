import { create } from "zustand";

import {
  HolidayDurationType,
  HolidayHalfDayState
} from "~community/people/types/HolidayTypes";

import holidaySlice from "./holidaySlice";

describe("holidaySlice", () => {
  it("should set holiday details correctly", () => {
    const useStore = create(holidaySlice);
    const { setHolidayDetails } = useStore.getState();

    const mockHolidayDetails = {
      holidayDate: "2023-12-25",
      holidayType: "Public",
      holidayReason: "Christmas",
      duration: HolidayDurationType.FULLDAY,
      halfDayState: HolidayHalfDayState.MORNING,
      holidayId: 1,
      holidayName: "",
      holidayColor: "red"
    };

    setHolidayDetails(mockHolidayDetails);
    expect(useStore.getState().newHolidayDetails).toEqual(mockHolidayDetails);
  });

  it("should reset holiday details correctly", () => {
    const useStore = create(holidaySlice);
    const { setHolidayDetails, resetHolidayDetails } = useStore.getState();

    setHolidayDetails({
      holidayDate: "2023-12-25",
      holidayType: "Public",
      holidayReason: "Christmas",
      duration: HolidayDurationType.FULLDAY,
      halfDayState: HolidayHalfDayState.MORNING,
      holidayId: 1,
      holidayColor: "red"
    });

    resetHolidayDetails();
    expect(useStore.getState().newHolidayDetails).toEqual({
      holidayDate: "",
      holidayType: "",
      holidayReason: "",
      duration: HolidayDurationType.NONE,
      halfDayState: HolidayHalfDayState.NONE,
      holidayId: 0,
      holidayName: "",
      holidayColor: ""
    });
  });

  it("should set failed count correctly", () => {
    const useStore = create(holidaySlice);
    const { setFailedCount } = useStore.getState();

    setFailedCount(5);
    expect(useStore.getState().failedCount).toBe(5);
  });

  it("should reset failed count correctly", () => {
    const useStore = create(holidaySlice);
    const { setFailedCount, resetFailedCount } = useStore.getState();

    setFailedCount(5);
    resetFailedCount();
    expect(useStore.getState().failedCount).toBe(0);
  });

  it("should set success count correctly", () => {
    const useStore = create(holidaySlice);
    const { setSuccessCount } = useStore.getState();

    setSuccessCount(10);
    expect(useStore.getState().successCount).toBe(10);
  });

  it("should reset success count correctly", () => {
    const useStore = create(holidaySlice);
    const { setSuccessCount, resetSuccessCount } = useStore.getState();

    setSuccessCount(10);
    resetSuccessCount();
    expect(useStore.getState().successCount).toBe(0);
  });

  it("should set isBulkUpload correctly", () => {
    const useStore = create(holidaySlice);
    const { setIsBulkUpload } = useStore.getState();

    setIsBulkUpload(true);
    expect(useStore.getState().isBulkUpload).toBe(true);

    setIsBulkUpload(false);
    expect(useStore.getState().isBulkUpload).toBe(false);
  });
});
