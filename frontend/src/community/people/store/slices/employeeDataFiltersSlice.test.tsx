import { create } from "zustand";

import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";

import { employeeDataFiltersSlice } from "./employeeDataFiltersSlice";

describe("employeeDataFiltersSlice", () => {
  it("should set selected employees correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setSelectedEmployees } = useStore.getState();

    setSelectedEmployees([1, 2, 3]);
    expect(useStore.getState().selectedEmployees).toEqual([1, 2, 3]);
  });

  it("should handle employee data sort correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { handleEmployeeDataSort } = useStore.getState();

    handleEmployeeDataSort("sortKey", SortKeyTypes.DATE);
    expect(useStore.getState().employeeDataParams.sortKey).toBe(
      SortKeyTypes.DATE
    );

    handleEmployeeDataSort("sortOrder", SortOrderTypes.DESC);
    expect(useStore.getState().employeeDataParams.sortOrder).toBe(
      SortOrderTypes.DESC
    );
  });

  it("should set employee data filter correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataFilter } = useStore.getState();

    setEmployeeDataFilter("team", ["Team A", "Team B"]);
    expect(useStore.getState().employeeDataFilter.team).toEqual([
      "Team A",
      "Team B"
    ]);
  });

  it("should reset employee data params correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { resetEmployeeDataParams, setEmployeeDataFilter } =
      useStore.getState();

    setEmployeeDataFilter("team", ["Team A"]);
    resetEmployeeDataParams();

    expect(useStore.getState().employeeDataFilter.team).toEqual([]);
    expect(useStore.getState().employeeDataParams.searchKeyword).toBe("");
    expect(useStore.getState().employeeDataParams.accountStatus).toBe("ACTIVE");
  });

  it("should set employee data params correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataParams } = useStore.getState();

    setEmployeeDataParams("searchKeyword", "John");
    expect(useStore.getState().employeeDataParams.searchKeyword).toBe("John");
  });

  it("should set employee data pagination correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataPagination } = useStore.getState();

    setEmployeeDataPagination(2);
    expect(useStore.getState().employeeDataParams.page).toBe(2);
  });

  it("should set employee data filter order correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataFilterOrder } = useStore.getState();

    setEmployeeDataFilterOrder(["team", "role"]);
    expect(useStore.getState().employeeDataFilterOrder).toEqual([
      "team",
      "role"
    ]);
  });

  it("should set menu items correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setMenuItems } = useStore.getState();

    const mockMenuItems = [{ id: 1, label: "Menu Item 1" }];
    setMenuItems(mockMenuItems);

    expect(useStore.getState().menuItems).toEqual(mockMenuItems);
  });

  it("should set searched items correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setSearchedItems } = useStore.getState();

    setSearchedItems(["Item 1", "Item 2"]);
    expect(useStore.getState().searchedItems).toEqual(["Item 1", "Item 2"]);
  });

  it("should set employee status param correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeStatusParam } = useStore.getState();

    setEmployeeStatusParam("inactive");
    expect(useStore.getState().employeeDataParams.isDeactivated).toBe(
      "inactive"
    );
  });

  it("should set pending invitation list open correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setIsPendingInvitationListOpen } = useStore.getState();

    setIsPendingInvitationListOpen(true);
    expect(useStore.getState().isPendingInvitationListOpen).toBe(true);
  });

  it("should remove employee filter correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataFilter, removeEmployeeFilter } = useStore.getState();

    setEmployeeDataFilter("team", ["Team A", "Team B"]);
    removeEmployeeFilter("Team A");

    expect(useStore.getState().employeeDataFilter.team).toEqual([
      "Team A",
      "Team B"
    ]);
  });

  it("should remove gender filter correctly", () => {
    const useStore = create(employeeDataFiltersSlice);
    const { setEmployeeDataFilter, removeGenderFilter } = useStore.getState();

    setEmployeeDataFilter("gender", "Male");
    removeGenderFilter();

    expect(useStore.getState().employeeDataFilter.gender).toBeNull();
  });
});
