import { create } from "zustand";

import { holidayModalTypes } from "~community/people/types/HolidayTypes";

import { holidayModalSlice } from "./holidayModalSlice";

describe("holidayModalSlice", () => {
  it("should set isHolidayModalOpen correctly", () => {
    const useStore = create(holidayModalSlice);
    const { setIsHolidayModalOpen } = useStore.getState();

    setIsHolidayModalOpen(true);
    expect(useStore.getState().isHolidayModalOpen).toBe(true);

    setIsHolidayModalOpen(false);
    expect(useStore.getState().isHolidayModalOpen).toBe(false);
  });

  it("should set holidayModalType correctly", () => {
    const useStore = create(holidayModalSlice);
    const { setHolidayModalType } = useStore.getState();

    setHolidayModalType(holidayModalTypes.ADD_HOLIDAY);
    expect(useStore.getState().holidayModalType).toBe(
      holidayModalTypes.ADD_HOLIDAY
    );

    setHolidayModalType(holidayModalTypes.NONE);
    expect(useStore.getState().holidayModalType).toBe(holidayModalTypes.NONE);
  });
});
