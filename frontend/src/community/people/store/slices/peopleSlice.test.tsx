import { create } from "zustand";

import { Role } from "~community/people/enums/PeopleEnums";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

import peopleSlice from "./peopleSlice";

describe("peopleSlice", () => {
  it("should set employee details correctly", () => {
    const useStore = create(peopleSlice);
    const { setEmployee } = useStore.getState();

    const mockEmployee = {
      personal: {
        general: { firstName: "John", lastName: "Doe" },
        contact: {},
        family: [],
        educational: [],
        socialMedia: {},
        healthAndOther: {}
      },
      emergency: {},
      employment: {},
      systemPermissions: {},
      common: {}
    };

    setEmployee(mockEmployee);
    expect(useStore.getState().employee).toEqual(mockEmployee);
  });

  it("should set personal details correctly", () => {
    const useStore = create(peopleSlice);
    const { setPersonalDetails } = useStore.getState();

    const mockPersonalDetails = {
      general: { firstName: "Jane", lastName: "Smith" }
    };

    setPersonalDetails(mockPersonalDetails);
    expect(useStore.getState().employee.personal.general).toEqual(
      mockPersonalDetails.general
    );
  });

  it("should set emergency details correctly", () => {
    const useStore = create(peopleSlice);
    const { setEmergencyDetails } = useStore.getState();

    const mockEmergencyDetails = {
      primaryEmergencyContact: { name: "Alice", contactNo: "123456789" }
    };

    setEmergencyDetails(mockEmergencyDetails);
    expect(
      useStore.getState().employee.emergency.primaryEmergencyContact
    ).toEqual(mockEmergencyDetails.primaryEmergencyContact);
  });

  it("should set employment details correctly", () => {
    const useStore = create(peopleSlice);
    const { setEmploymentDetails } = useStore.getState();

    const mockEmploymentDetails = {
      employmentDetails: { employeeNumber: "EMP001" }
    };

    setEmploymentDetails(mockEmploymentDetails);
    expect(useStore.getState().employee.employment.employmentDetails).toEqual(
      mockEmploymentDetails.employmentDetails
    );
  });

  it("should set system permissions correctly", () => {
    const useStore = create(peopleSlice);
    const { setSystemPermissions } = useStore.getState();

    const mockSystemPermissions = {
      attendanceRole: "ATTENDANCE_EMPLOYEE",
      esignRole: "ESIGN_EMPLOYEE",
      leaveRole: "LEAVE_EMPLOYEE",
      isSuperAdmin: true,
      peopleRole: Role.PEOPLE_ADMIN
    };

    setSystemPermissions(mockSystemPermissions);
    expect(useStore.getState().employee.systemPermissions).toEqual(
      mockSystemPermissions
    );
  });

  it("should set common details correctly", () => {
    const useStore = create(peopleSlice);
    const { setCommonDetails } = useStore.getState();

    const mockCommonDetails = { jobTitle: "Software Engineer" };

    setCommonDetails(mockCommonDetails);
    expect(useStore.getState().employee.common.jobTitle).toBe(
      "Software Engineer"
    );
  });

  it("should reset people slice correctly", () => {
    const useStore = create(peopleSlice);
    const { setEmployee, resetPeopleSlice } = useStore.getState();

    const mockEmployee = {
      personal: { general: { firstName: "John" } },
      emergency: {},
      employment: {},
      systemPermissions: {},
      common: {}
    };

    setEmployee(mockEmployee);
    resetPeopleSlice();

    expect(useStore.getState().employee.personal.general.firstName).toBe("");
  });

  it("should set entitlement details correctly", () => {
    const useStore = create(peopleSlice);
    const { setEntitlementDetails } = useStore.getState();

    const mockEntitlementDetails = [{ id: 1, name: "Leave" }];

    setEntitlementDetails(mockEntitlementDetails);
    expect(useStore.getState().entitlementDetails).toEqual(
      mockEntitlementDetails
    );
  });

  it("should set active step correctly", () => {
    const useStore = create(peopleSlice);
    const { setActiveStep } = useStore.getState();

    setActiveStep(2);
    expect(useStore.getState().activeStep).toBe(2);
  });

  it("should set next step correctly", () => {
    const useStore = create(peopleSlice);
    const { setNextStep } = useStore.getState();

    setNextStep(EditPeopleFormTypes.employment);
    expect(useStore.getState().nextStep).toBe(EditPeopleFormTypes.employment);
  });

  it("should set current step correctly", () => {
    const useStore = create(peopleSlice);
    const { setCurrentStep } = useStore.getState();

    setCurrentStep(EditPeopleFormTypes.emergency);
    expect(useStore.getState().currentStep).toBe(EditPeopleFormTypes.emergency);
  });
});
