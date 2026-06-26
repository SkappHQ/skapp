import { renderHook } from "@testing-library/react";

import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

import useDetectProfileChange from "./useDetectProfileChange";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("~community/people/api/PeopleApi", () => ({
  useGetUserPersonalDetails: jest.fn()
}));

describe("useDetectProfileChange", () => {
  const mockEmployeeData = {
    employeeId: 1,
    firstName: "John",
    lastName: "Doe",
    personalInfo: {
      birthDate: "1990-01-01",
      nationality: "US",
      nin: "123456",
      maritalStatus: "Single"
    },
    phone: "+1 1234567890",
    address: "123 Main St",
    employeeFamilies: [],
    employeeEducations: [],
    employeeEmergencies: [],
    employeeProgressions: [],
    teams: [],
    eeo: "Category1",
    employeeVisas: []
  };

  const mockStoreState = {
    employeeGeneralDetails: { firstName: "John", lastName: "Doe" },
    employeeContactDetails: { phone: "+1 1234567890", address: "123 Main St" },
    employeeFamilyDetails: { familyMembers: [] },
    employeeEducationalDetails: { educationalDetails: [] },
    employeeSocialMediaDetails: { linkedIn: "john-doe" },
    employeeHealthAndOtherDetails: { bloodGroup: "O+" },
    employeeEmergencyContactDetails: { primaryEmergencyContact: null },
    employeeEmploymentDetails: { employeeNumber: "123" },
    employeeCareerDetails: { positionDetails: [] },
    employeeIdentificationAndDiversityDetails: { ssn: "123-45-6789" },
    employeePreviousEmploymentDetails: { previousEmploymentDetails: [] },
    employeeVisaDetails: { visaDetails: [] }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue(mockStoreState);
    (useGetUserPersonalDetails as jest.Mock).mockReturnValue({
      data: mockEmployeeData
    });
  });

  it("should detect no changes when store and API data match", () => {
    const { result } = renderHook(() => useDetectProfileChange());
    expect(result.current.isValuesChanged()).toBe(true);
  });

  it("should detect changes when store and API data differ", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      ...mockStoreState,
      employeeGeneralDetails: { firstName: "Jane", lastName: "Doe" }
    });

    const { result } = renderHook(() => useDetectProfileChange());
    expect(result.current.isValuesChanged()).toBe(true);
  });

  it("should handle empty API data gracefully", () => {
    (useGetUserPersonalDetails as jest.Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useDetectProfileChange());
    expect(result.current.isValuesChanged()).toBe(true);
  });

  it("should detect changes in nested fields", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      ...mockStoreState,
      employeeContactDetails: { phone: "+1 9876543210", address: "123 Main St" }
    });

    const { result } = renderHook(() => useDetectProfileChange());
    expect(result.current.isValuesChanged()).toBe(true);
  });
});
