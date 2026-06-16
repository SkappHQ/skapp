import { AccountStatus } from "~community/leave/types/LeaveTypes";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import { RelationshipTypes } from "~community/people/types/EmployeeTypes";

import useUserBulkConvert from "./useUserBulkConvert";

describe("useUserBulkConvert", () => {
  const { convertUsers } = useUserBulkConvert();

  const mockJobRoleList = [
    {
      name: "Engineering",
      jobFamilyId: "1",
      jobTitles: [{ name: "Software Engineer", jobTitleId: "101" }]
    },
    {
      name: "HR",
      jobFamilyId: "2",
      jobTitles: [{ name: "HR Manager", jobTitleId: "201" }]
    }
  ];

  it("should convert users correctly with valid data", () => {
    const mockUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        jobFamilyId: "Engineering",
        jobTitleId: "Software Engineer",
        contactNoDialCode: "+1",
        contactNo: "1234567890",
        emergencyRelationship: "Spouse",
        employeeType: "FULL_TIME",
        joinedDate: "2023-01-01"
      }
    ];

    const result = convertUsers(mockUsers, mockJobRoleList);

    expect(result).toEqual([
      {
        teams: null,
        firstName: "John",
        middleName: undefined,
        lastName: "Doe",
        address: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: "undefined undefined",
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        primaryManager: undefined,
        secondaryManager: null,
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
        employeeProgression: {
          employmentType: "FULL_TIME",
          jobFamilyId: "1",
          jobTitleId: "101",
          startDate: "2023-01-01",
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
        jobFamilyId: "HR",
        jobTitleId: "HR Manager",
        joinedDate: "2023-02-01"
      }
    ];

    const result = convertUsers(mockUsers, mockJobRoleList);

    expect(result).toEqual([
      {
        teams: null,
        firstName: "Jane",
        middleName: undefined,
        lastName: "Smith",
        address: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: null,
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        primaryManager: undefined,
        secondaryManager: null,
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
        employeeProgression: {
          employmentType: null,
          jobFamilyId: "2",
          jobTitleId: "201",
          startDate: "2023-02-01",
          endDate: null,
          isCurrent: true
        }
      }
    ]);
  });

  it("should return an empty array when no users are provided", () => {
    const result = convertUsers([], mockJobRoleList);
    expect(result).toEqual([]);
  });

  it("should handle users with invalid job family or title", () => {
    const mockUsers = [
      {
        firstName: "Invalid",
        lastName: "User",
        jobFamilyId: "NonExistent",
        jobTitleId: "NonExistent",
        joinedDate: "2023-03-01"
      }
    ];

    const result = convertUsers(mockUsers, mockJobRoleList);

    expect(result).toEqual([
      {
        teams: null,
        firstName: "Invalid",
        middleName: undefined,
        lastName: "User",
        address: undefined,
        addressLine2: undefined,
        country: undefined,
        personalEmail: undefined,
        workEmail: undefined,
        gender: undefined,
        phone: null,
        identificationNo: undefined,
        permission: SystemPermissionTypes.EMPLOYEES,
        timeZone: "undefined",
        primaryManager: undefined,
        secondaryManager: null,
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
        employeeProgression: {
          employmentType: null,
          jobFamilyId: null,
          jobTitleId: null,
          startDate: "2023-03-01",
          endDate: null,
          isCurrent: true
        }
      }
    ]);
  });
});
