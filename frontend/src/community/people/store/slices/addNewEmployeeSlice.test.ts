import { create } from "zustand";

import { Role } from "~community/people/types/EmployeeTypes";

import { employeeDetailsSlice } from "./addNewEmployeeSlice";

describe("addNewEmployeeSlice", () => {
  it("should update userRoles correctly", () => {
    const useStore = create(employeeDetailsSlice);
    const { setUserRoles, userRoles } = useStore.getState();

    setUserRoles("peopleRole", Role.PEOPLE_ADMIN);

    expect(useStore.getState().userRoles.peopleRole).toBe(Role.PEOPLE_ADMIN);
  });

  it("should update employeeGeneralDetails correctly", () => {
    const useStore = create(employeeDetailsSlice);
    const { setEmployeeGeneralDetails } = useStore.getState();

    setEmployeeGeneralDetails("firstName", "John");

    expect(useStore.getState().employeeGeneralDetails.firstName).toBe("John");
  });

  it("should update employeeContactDetails correctly", () => {
    const useStore = create(employeeDetailsSlice);
    const { setEmployeeContactDetails } = useStore.getState();

    setEmployeeContactDetails("phone", "123456789");

    expect(useStore.getState().employeeContactDetails.phone).toBe("123456789");
  });

  it("should reset employeeDataChanges correctly", () => {
    const useStore = create(employeeDetailsSlice);
    const { reinitializeFormik, resetEmployeeDataChanges } =
      useStore.getState();

    reinitializeFormik();
    expect(useStore.getState().employeeDataChanges).toBe(1);

    resetEmployeeDataChanges();
    expect(useStore.getState().employeeDataChanges).toBe(0);
  });
});
