import { renderHook } from "@testing-library/react";

import { useGetEmployeeById } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";

import useGetDefaultCountryCode from "./useGetDefaultCountryCode";
import useGetEmployee from "./useGetEmployee";

jest.mock("~community/people/api/PeopleApi", () => ({
  useGetEmployeeById: jest.fn()
}));

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("./useGetDefaultConuntryCode", () => jest.fn());

describe("useGetEmployee", () => {
  const mockResetEmployeeData = jest.fn();
  const mockSetEmployeeGeneralDetails = jest.fn();
  const mockReinitializeFormik = jest.fn();
  const mockResetEmployeeDataChanges = jest.fn();

  const mockEmployee = {
    firstName: "John",
    lastName: "Doe",
    personalInfo: {
      birthDate: "1990-01-01",
      nationality: "US",
      nin: "123456",
      passportNo: "A1234567",
      maritalStatus: "Single",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      extraInfo: {
        bloodGroup: "O+",
        allergies: "None",
        dietaryRestrictions: "Vegetarian",
        tshirtSize: "M"
      },
      socialMediaDetails: {
        linkedIn: "john-doe",
        facebook: "john.doe",
        instagram: "johndoe",
        x: "johndoe"
      }
    },
    phone: "1 1234567890",
    address: "123 Main St",
    addressLine2: "Apt 4B",
    country: "United States",
    employeeFamilies: [
      {
        familyId: 1,
        firstName: "Jane",
        lastName: "Doe",
        gender: "Female",
        familyRelationship: "Spouse",
        birthDate: "1992-01-01",
        parentName: "N/A"
      }
    ],
    employeeEducations: [
      {
        educationId: 1,
        institution: "University A",
        degree: "Bachelor's",
        specialization: "Computer Science",
        startDate: "2008-01-01",
        endDate: "2012-01-01"
      }
    ],
    employeeEmergencies: [
      {
        emergencyId: 1,
        name: "Jane Doe",
        emergencyRelationship: "Spouse",
        contactNo: "1 9876543210",
        isPrimary: true
      }
    ],
    identificationNo: "EMP123",
    email: "john.doe@example.com",
    joinDate: "2015-01-01",
    timeZone: "EST",
    userRoles: {
      isSuperAdmin: true,
      attendanceRole: "Manager",
      peopleRole: "Admin",
      leaveRole: "User",
      esignRole: "User"
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      resetEmployeeData: mockResetEmployeeData,
      setEmployeeGeneralDetails: mockSetEmployeeGeneralDetails,
      reinitializeFormik: mockReinitializeFormik,
      resetEmployeeDataChanges: mockResetEmployeeDataChanges
    });
    (useGetEmployeeById as jest.Mock).mockReturnValue({
      data: mockEmployee,
      isSuccess: true,
      isLoading: false
    });
    (useGetDefaultCountryCode as jest.Mock).mockReturnValue("1");
  });

  it("should reset employee data when loading starts", () => {
    (useGetEmployeeById as jest.Mock).mockReturnValue({
      data: null,
      isSuccess: false,
      isLoading: true
    });

    renderHook(() => useGetEmployee({ id: 1 }));

    expect(mockResetEmployeeData).toHaveBeenCalled();
  });
});
