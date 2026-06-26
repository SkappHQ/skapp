import { create } from "zustand";

import { SortOrderTypes } from "~community/common/types/CommonTypes";

import holidayDataFiltersSlice from "./holidayDataFilterSlice";

describe("holidayDataFiltersSlice", () => {
  it("should handle holiday data sort correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { handleHolidayDataSort } = useStore.getState();

    handleHolidayDataSort("sortOrder", SortOrderTypes.DESC);
    expect(useStore.getState().holidayDataParams.sortOrder).toBe(
      SortOrderTypes.DESC
    );
  });

  it("should set holiday data filter correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setHolidayDataFilter } = useStore.getState();

    setHolidayDataFilter("type", ["Public", "Company"]);
    expect(useStore.getState().holidayDataFilter.type).toEqual([
      "Public",
      "Company"
    ]);
  });

  it("should reset holiday data params correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { resetHolidayDataParams, setHolidayDataFilter } =
      useStore.getState();

    setHolidayDataFilter("type", ["Public"]);
    resetHolidayDataParams();

    expect(useStore.getState().holidayDataFilter.type).toEqual([]);
    expect(useStore.getState().holidayDataParams.sortOrder).toBe(
      SortOrderTypes.ASC
    );
  });

  it("should set holiday data params correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setHolidayDataParams } = useStore.getState();

    setHolidayDataParams("holidayTypes", ["Public", "Company"]);
    expect(useStore.getState().holidayDataParams.holidayTypes).toBe(
      "Public,Company,"
    );
  });

  it("should set holiday data pagination correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setHolidayDataPagination } = useStore.getState();

    setHolidayDataPagination(2);
    expect(useStore.getState().holidayDataParams.page).toBe(2);
  });

  it("should set individual delete ID correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setIndividualDeleteId } = useStore.getState();

    setIndividualDeleteId(123);
    expect(useStore.getState().individualDeleteId).toBe(123);
  });

  it("should set selected delete IDs correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setSelectedDeleteIds } = useStore.getState();

    setSelectedDeleteIds([1, 2, 3]);
    expect(useStore.getState().selectedDeleteIds).toEqual([1, 2, 3]);
  });

  it("should set selected year correctly", () => {
    const useStore = create(holidayDataFiltersSlice);
    const { setSelectedYear } = useStore.getState();

    setSelectedYear("2025");
    expect(useStore.getState().selectedYear).toBe("2025");
  });
});
