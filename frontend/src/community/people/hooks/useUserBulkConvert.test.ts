import { AccountStatus } from "~community/leave/types/LeaveTypes";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import { RelationshipTypes } from "~community/people/types/EmployeeTypes";

import useUserBulkConvert from "./useUserBulkConvert";

describe("useUserBulkConvert", () => {
  const { convertUsers } = useUserBulkConvert();

  it("should convert users correctly with valid data", () => {
    const mockUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        jobFamily: "Engineering",
        jobTitle: "Software Engineer",
        contactNoDialCode: "+1",
        contactNo: "1234567890",
        emergencyRelationship: "Spouse",
        employeeType: "FULL_TIME",
        joinedDate: "2023-01-01",
        careerProgressionStartDate: "2023-01-15"
      }
    ];

    const result = convertUsers(mockUsers);

    expect(result).toEqual([
      {
        teams: null,
        title: null,
        firstName: "John",
        middleName: undefined,
        lastName: "Doe",
        addressLine1: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: null,
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        workLocation: null,
        businessUnit: null,
        primaryManager: undefined,
        joinedDate: "2023-01-01",
        accountStatus: AccountStatus.PENDING,
        employmentAllocation: null,
        eeo: null,
        employeePersonalInfo: {
          city: undefined,
          state: undefined,
          postalCode: undefined,
          birthDate: undefined,
          maritalStatus: null,
          nationality: undefined,
          nin: undefined,
          ethnicity: null,
          ssn: undefined,
          socialMediaDetails: {
            facebook: undefined,
            x: undefined,
            linkedIn: undefined,
            instagram: undefined
          },
          bloodGroup: null,
          extraInfo: {
            allergies: undefined,
            dietaryRestrictions: undefined,
            tShirtSize: undefined
          },
          passportNo: undefined
        },
        employeePeriod: {
          startDate: undefined,
          endDate: undefined
        },
        employeeEmergency: {
          name: undefined,
          emergencyRelationship: RelationshipTypes.SPOUSE,
          contactNo: "1 1234567890",
          isPrimary: true
        },
        employeeType: "FULL_TIME",
        jobFamily: "Engineering",
        jobTitle: "Software Engineer",
        employeeProgression: {
          employmentType: "FULL_TIME",
          startDate: "2023-01-15",
          endDate: null,
          isCurrent: true
        }
      }
    ]);
  });

  it("should handle users with missing optional fields", () => {
    const mockUsers = [
      {
        firstName: "Jane",
        lastName: "Smith",
        jobFamily: "HR",
        jobTitle: "HR Manager",
        joinedDate: "2023-02-01"
      }
    ];

    const result = convertUsers(mockUsers);

    expect(result).toEqual([
      {
        teams: null,
        title: null,
        firstName: "Jane",
        middleName: undefined,
        lastName: "Smith",
        addressLine1: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: null,
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        workLocation: null,
        businessUnit: null,
        primaryManager: undefined,
        joinedDate: "2023-02-01",
        accountStatus: AccountStatus.PENDING,
        employmentAllocation: null,
        eeo: null,
        employeePersonalInfo: {
          city: undefined,
          state: undefined,
          postalCode: undefined,
          birthDate: undefined,
          maritalStatus: null,
          nationality: undefined,
          nin: undefined,
          ethnicity: null,
          ssn: undefined,
          socialMediaDetails: {
            facebook: undefined,
            x: undefined,
            linkedIn: undefined,
            instagram: undefined
          },
          bloodGroup: null,
          extraInfo: {
            allergies: undefined,
            dietaryRestrictions: undefined,
            tShirtSize: undefined
          },
          passportNo: undefined
        },
        employeePeriod: {
          startDate: undefined,
          endDate: undefined
        },
        employeeEmergency: {
          name: undefined,
          emergencyRelationship: null,
          contactNo: null,
          isPrimary: true
        },
        employeeType: null,
        jobFamily: "HR",
        jobTitle: "HR Manager",
        employeeProgression: {
          employmentType: null,
          startDate: null,
          endDate: null,
          isCurrent: true
        }
      }
    ]);
  });

  it("should return an empty array when no users are provided", () => {
    const result = convertUsers([]);
    expect(result).toEqual([]);
  });

  it("should handle users with invalid job family or title", () => {
    const mockUsers = [
      {
        firstName: "Invalid",
        lastName: "User",
        jobFamily: "NonExistent",
        jobTitle: "NonExistent",
        joinedDate: "2023-03-01"
      }
    ];

    const result = convertUsers(mockUsers);

    expect(result).toEqual([
      {
        teams: null,
        title: null,
        firstName: "Invalid",
        middleName: undefined,
        lastName: "User",
        addressLine1: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: null,
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        workLocation: null,
        businessUnit: null,
        primaryManager: undefined,
        joinedDate: "2023-03-01",
        accountStatus: AccountStatus.PENDING,
        employmentAllocation: null,
        eeo: null,
        employeePersonalInfo: {
          city: undefined,
          state: undefined,
          postalCode: undefined,
          birthDate: undefined,
          maritalStatus: null,
          nationality: undefined,
          nin: undefined,
          ethnicity: null,
          ssn: undefined,
          socialMediaDetails: {
            facebook: undefined,
            x: undefined,
            linkedIn: undefined,
            instagram: undefined
          },
          bloodGroup: null,
          extraInfo: {
            allergies: undefined,
            dietaryRestrictions: undefined,
            tShirtSize: undefined
          },
          passportNo: undefined
        },
        employeePeriod: {
          startDate: undefined,
          endDate: undefined
        },
        employeeEmergency: {
          name: undefined,
          emergencyRelationship: null,
          contactNo: null,
          isPrimary: true
        },
        employeeType: null,
        jobFamily: "NonExistent",
        jobTitle: "NonExistent",
        employeeProgression: {
          employmentType: null,
          startDate: null,
          endDate: null,
          isCurrent: true
        }
      }
    ]);
  });
});
