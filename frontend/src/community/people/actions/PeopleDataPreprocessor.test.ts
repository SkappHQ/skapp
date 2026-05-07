jest.mock("~community/common/utils/commonUtil", () => ({
  formatDate: (date: string) => date,
  formatEmptyString: (str: string) => str || null,
  formatPhoneNumber: (code: string, phone: string) =>
    code && phone ? `${code}${phone}` : ""
}));

import {
  EmploymentAllocationTypes,
  EmploymentTypes,
  GenderTypes,
  RelationshipTypes
} from "../types/AddNewResourceTypes";
import { EmploymentStatusTypes, Role } from "../types/EmployeeTypes";
import { employeeCreatePreProcessor } from "./PeopleDataPreprocessor";

const buildMockEmployee = (overrides = {}) => ({
  generalDetails: {
    authPic: null,
    thumbnail: null,
    title: null,
    firstName: "Jane",
    middleName: "M",
    lastName: "Doe",
    gender: GenderTypes.FEMALE,
    birthDate: "1995-03-15",
    nationality: "US",
    nin: "ABC123",
    passportNumber: "P123456",
    maritalStatus: "Single"
  },
  contactDetails: {
    personalEmail: "jane.personal@example.com",
    countryCode: "+1",
    phone: "1234567890",
    addressLine1: "123 Main St",
    addressLine2: "Apt 4",
    city: "New York",
    country: "US",
    state: "NY",
    postalCode: "10001"
  },
  familyDetails: {
    familyMembers: []
  },
  educationalDetails: {
    educationalDetails: []
  },
  socialMediaDetails: {
    linkedIn: "https://linkedin.com/in/janedoe",
    facebook: null,
    instagram: null,
    x: null
  },
  healthAndOtherDetails: {
    bloodGroup: null,
    allergies: null,
    dietaryRestrictions: null,
    tshirtSize: null
  },
  emergencyDetails: {
    primaryEmergencyContact: {
      name: "John Doe",
      relationship: RelationshipTypes.PARENT,
      countryCode: "+1",
      phone: "9876543210"
    },
    secondaryEmergencyContact: {
      name: "",
      relationship: "",
      countryCode: "",
      phone: ""
    }
  },
  employmentDetails: {
    employeeNumber: "EMP001",
    workEmail: "jane@company.com",
    employmentStatus: EmploymentStatusTypes.ACTIVE,
    employmentAllocation: EmploymentAllocationTypes.FULL_TIME,
    systemPermission: "",
    teams: [1, 2],
    primarySupervisor: {
      employeeId: "10",
      firstName: "Manager",
      lastName: "One",
      avatarUrl: ""
    },
    secondarySupervisor: {
      employeeId: "",
      firstName: "",
      lastName: "",
      avatarUrl: ""
    },
    joinedDate: "2024-01-15",
    probationStartDate: "2024-01-15",
    probationEndDate: "2024-07-15",
    workTimeZone: "America/New_York"
  },
  careerDetails: {
    positionDetails: [
      {
        employeeType: EmploymentTypes.PERMANENT,
        jobFamily: 1,
        jobTitle: 2,
        startDate: "2024-01-15",
        endDate: "",
        currentPosition: true
      }
    ]
  },
  identificationAndDiversityDetails: {
    ssn: null,
    ethnicity: null,
    eeoJobCategory: ""
  },
  previousEmploymentDetails: {
    previousEmploymentDetails: []
  },
  visaDetails: {
    visaDetails: []
  },
  userRoles: {
    isSuperAdmin: false,
    peopleRole: Role.PEOPLE_EMPLOYEE,
    leaveRole: Role.LEAVE_EMPLOYEE,
    attendanceRole: Role.ATTENDANCE_EMPLOYEE
  },
  ...overrides
});

describe("employeeCreatePreProcessor", () => {
  it("should map basic name fields correctly", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.firstName).toBe("Jane");
    expect(result.lastName).toBe("Doe");
    expect(result.middleName).toBe("M");
  });

  it("should map work email from employment details", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.workEmail).toBe("jane@company.com");
  });

  it("should map identificationNo from employeeNumber", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.identificationNo).toBe("EMP001");
  });

  it("should map teams array", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.teams).toEqual([1, 2]);
  });

  it("should map primaryManager from supervisor employeeId", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.primaryManager).toBe(10);
  });

  it("should map employmentAllocation", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employmentAllocation).toBe(
      EmploymentAllocationTypes.FULL_TIME
    );
  });

  it("should map probation period dates", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.probationPeriod).toBeDefined();
    expect(result.probationPeriod?.startDate).toBeDefined();
    expect(result.probationPeriod?.endDate).toBeDefined();
  });

  it("should map career progressions correctly", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeProgressions).toHaveLength(1);
    expect(result.employeeProgressions?.[0]?.employeeType).toBe(
      EmploymentTypes.PERMANENT
    );
    expect(result.employeeProgressions?.[0]?.isCurrent).toBe(true);
  });

  it("should return empty progressions when none exist", () => {
    const employee = buildMockEmployee({
      careerDetails: { positionDetails: [] }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeProgressions).toEqual([]);
  });

  it("should filter out incomplete emergency contacts", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    // Primary has all fields, secondary has empty fields
    expect(result.employeeEmergency).toHaveLength(1);
    expect(result.employeeEmergency?.[0]?.isPrimary).toBe(true);
    expect(result.employeeEmergency?.[0]?.name).toBe("John Doe");
  });

  it("should include both emergency contacts when both are complete", () => {
    const employee = buildMockEmployee({
      emergencyDetails: {
        primaryEmergencyContact: {
          name: "John Doe",
          relationship: RelationshipTypes.PARENT,
          countryCode: "+1",
          phone: "9876543210"
        },
        secondaryEmergencyContact: {
          name: "Jane Smith",
          relationship: RelationshipTypes.FRIEND,
          countryCode: "+1",
          phone: "5551234567"
        }
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeEmergency).toHaveLength(2);
  });

  it("should map personal info nested fields", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeePersonalInfo?.city).toBe("New York");
    expect(result.employeePersonalInfo?.state).toBe("NY");
    expect(result.employeePersonalInfo?.nationality).toBe("US");
    expect(result.employeePersonalInfo?.nin).toBe("ABC123");
  });

  it("should map social media details", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeePersonalInfo?.socialMediaDetails?.linkedIn).toBe(
      "https://linkedin.com/in/janedoe"
    );
  });

  it("should return empty arrays for empty family, education, and visa", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeFamilies).toEqual([]);
    expect(result.employeeEducations).toEqual([]);
    expect(result.employeeVisas).toEqual([]);
  });

  it("should map family members when present", () => {
    const employee = buildMockEmployee({
      familyDetails: {
        familyMembers: [
          {
            firstName: "Child",
            lastName: "Doe",
            gender: GenderTypes.MALE,
            relationship: RelationshipTypes.CHILD,
            birthDate: "2020-01-01",
            parentName: "Jane Doe"
          }
        ]
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeFamilies).toHaveLength(1);
    expect(result.employeeFamilies?.[0]?.firstName).toBe("Child");
    expect(result.employeeFamilies?.[0]?.familyRelationship).toBe(
      RelationshipTypes.CHILD
    );
  });

  it("should map educational details when present", () => {
    const employee = buildMockEmployee({
      educationalDetails: {
        educationalDetails: [
          {
            institutionName: "MIT",
            degree: "BSc",
            major: "CS",
            startDate: "2015-09-01",
            endDate: "2019-06-01"
          }
        ]
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeEducations).toHaveLength(1);
    expect(result.employeeEducations?.[0]?.institution).toBe("MIT");
    expect(result.employeeEducations?.[0]?.specialization).toBe("CS");
  });

  it("should map visa details when present", () => {
    const employee = buildMockEmployee({
      visaDetails: {
        visaDetails: [
          {
            visaType: "H1B",
            issuingCountry: "US",
            issuedDate: "2024-01-01",
            expirationDate: "2027-01-01"
          }
        ]
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.employeeVisas).toHaveLength(1);
    expect((result.employeeVisas as any)?.[0]?.visaType).toBe("H1B");
  });

  it("should pass through userRoles", () => {
    const employee = buildMockEmployee();
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.userRoles).toBeDefined();
  });

  it("should handle null title by passing null", () => {
    const employee = buildMockEmployee({
      generalDetails: {
        ...buildMockEmployee().generalDetails,
        title: ""
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.title).toBeNull();
  });

  it("should handle null gender by passing null", () => {
    const employee = buildMockEmployee({
      generalDetails: {
        ...buildMockEmployee().generalDetails,
        gender: ""
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.gender).toBeNull();
  });

  it("should handle middleName formatting for empty string", () => {
    const employee = buildMockEmployee({
      generalDetails: {
        ...buildMockEmployee().generalDetails,
        middleName: ""
      }
    });
    const result = employeeCreatePreProcessor(employee as any);

    expect(result.middleName).toBeDefined();
  });
});
