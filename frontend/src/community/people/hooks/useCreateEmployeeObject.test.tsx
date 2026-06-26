import { renderHook } from "@testing-library/react";

import { DEFAULT_COUNTRY_CODE } from "~community/common/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import { EmploymentStatusTypes } from "~community/people/types/EmployeeTypes";

import useCreateEmployeeObject from "./useCreateEmployeeObject";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useCreateEmployeeObject", () => {
  const mockState = {
    employeeGeneralDetails: { name: "John Doe" },
    employeeContactDetails: { countryCode: DEFAULT_COUNTRY_CODE },
    employeeFamilyDetails: { spouseName: "Jane Doe" },
    employeeEducationalDetails: { degree: "BSc" },
    employeeSocialMediaDetails: { linkedIn: "john-doe" },
    employeeHealthAndOtherDetails: { bloodGroup: "O+" },
    employeeEmergencyContactDetails: {
      primaryEmergencyContact: { countryCode: DEFAULT_COUNTRY_CODE },
      secondaryEmergencyContact: { countryCode: DEFAULT_COUNTRY_CODE }
    },
    employeeEmploymentDetails: {
      employmentStatus: EmploymentStatusTypes.PENDING,
      systemPermission: SystemPermissionTypes.EMPLOYEES
    },
    employeeCareerDetails: { position: "Developer" },
    employeeIdentificationAndDiversityDetails: { idNumber: "12345" },
    employeePreviousEmploymentDetails: { company: "ABC Corp" },
    employeeVisaDetails: { visaType: "H1B" },
    employeeEntitlementsDetails: { leaveBalance: 10 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue(mockState);
  });

  it("should return the employee object with default values replaced by empty strings", () => {
    const { result } = renderHook(() =>
      useCreateEmployeeObject({ replaceDefaultValuesWithEmptyStrings: true })
    );

    const employeeObject = result.current.getEmployeeObject();

    expect(employeeObject).toEqual({
      ...mockState.employeeGeneralDetails,
      employeeContactDetails: { countryCode: "" },
      ...mockState.employeeFamilyDetails,
      ...mockState.employeeEducationalDetails,
      ...mockState.employeeSocialMediaDetails,
      ...mockState.employeeHealthAndOtherDetails,
      employeeEmergencyContactDetails: {
        primaryEmergencyContact: { countryCode: "" },
        secondaryEmergencyContact: { countryCode: "" }
      },
      employeeEmploymentDetails: {
        employmentStatus: "",
        systemPermission: ""
      },
      ...mockState.employeeCareerDetails,
      ...mockState.employeeIdentificationAndDiversityDetails,
      ...mockState.employeePreviousEmploymentDetails,
      ...mockState.employeeVisaDetails,
      ...mockState.employeeEntitlementsDetails
    });
  });

  it("should return the employee object without replacing default values", () => {
    const { result } = renderHook(() =>
      useCreateEmployeeObject({ replaceDefaultValuesWithEmptyStrings: false })
    );

    const employeeObject = result.current.getEmployeeObject();

    expect(employeeObject).toEqual({
      ...mockState.employeeGeneralDetails,
      employeeContactDetails: { countryCode: DEFAULT_COUNTRY_CODE },
      ...mockState.employeeFamilyDetails,
      ...mockState.employeeEducationalDetails,
      ...mockState.employeeSocialMediaDetails,
      ...mockState.employeeHealthAndOtherDetails,
      employeeEmergencyContactDetails: {
        primaryEmergencyContact: { countryCode: DEFAULT_COUNTRY_CODE },
        secondaryEmergencyContact: { countryCode: DEFAULT_COUNTRY_CODE }
      },
      employeeEmploymentDetails: {
        employmentStatus: EmploymentStatusTypes.PENDING,
        systemPermission: SystemPermissionTypes.EMPLOYEES
      },
      ...mockState.employeeCareerDetails,
      ...mockState.employeeIdentificationAndDiversityDetails,
      ...mockState.employeePreviousEmploymentDetails,
      ...mockState.employeeVisaDetails,
      ...mockState.employeeEntitlementsDetails
    });
  });
});
