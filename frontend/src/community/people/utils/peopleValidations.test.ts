import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";

import {
  employeeCareerDetailsValidation,
  employeeEmergencyContactDetailsValidation,
  employeeEmploymentDetailsValidation,
  employeeEntitlementsDetailsValidation,
  employeeGeneralDetailsValidation,
  employeeSocialMediaDetailsValidation,
  quickAddEmployeeValidations
} from "./peopleValidations";

const translator = (suffixes: string[]) => suffixes[0];

describe("Emergency Contact Validation", () => {
  describe("Primary Emergency Contact", () => {
    const schema = employeeEmergencyContactDetailsValidation(translator);

    it("should validate valid primary emergency contact details", async () => {
      const validData = {
        name: "John Doe",
        relationship: "Father",
        contactNo: "0114567890"
      };
      await expect(schema.validate(validData)).resolves.toBeTruthy();
    });

    it("should reject phone number that is too short", async () => {
      const invalidData = {
        name: "John Doe",
        relationship: "Father",
        contactNo: "094"
      };
      await expect(schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe("Secondary Emergency Contact", () => {
    const schema = employeeEmergencyContactDetailsValidation(translator);

    it("should validate complete valid data", async () => {
      const validData = {
        name: "John Doe",
        relationship: "Father",
        contactNo: "1234567890"
      };
      await expect(schema.validate(validData)).resolves.toBeTruthy();
    });

    it("should require all fields if name is provided", async () => {
      const partialData = { name: "John Doe", relationship: "", contactNo: "" };
      await expect(schema.validate(partialData)).rejects.toThrow();
    });

    it("should require all fields if relationship is provided", async () => {
      const partialData = { name: "", relationship: "Father", contactNo: "" };
      await expect(schema.validate(partialData)).rejects.toThrow();
    });

    it("should reject invalid phone format", async () => {
      const invalidData = {
        name: "John Doe",
        relationship: "Father",
        contactNo: "123"
      };
      await expect(schema.validate(invalidData)).rejects.toThrow();
    });

    it("should reject invalid name format", async () => {
      const invalidData = {
        name: "@1gf02",
        relationship: "Father",
        contactNo: "076"
      };
      await expect(schema.validate(invalidData)).rejects.toThrow();
    });
  });
});

describe("General Details Validation", () => {
  const schema = employeeGeneralDetailsValidation(translator);

  it("should validate valid general details", async () => {
    const validData = {
      firstName: "John",
      lastName: "Doe",
      middleName: "Smith",
      gender: "Male",
      birthDate: new Date().toISOString(),
      nationality: "US",
      nin: "ABC123",
      passportNumber: "PASS123",
      maritalStatus: "Single"
    };
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should reject missing required fields", async () => {
    const invalidData = { firstName: "", lastName: "" };
    await expect(schema.validate(invalidData)).rejects.toThrow();
  });

  it("should validate NIN format", async () => {
    const invalidData = {
      firstName: "John",
      lastName: "Doe",
      nin: "@invalid#"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow();
  });
});

describe("Employment Details Validation", () => {
  const context = {
    isUniqueEmployeeNo: true,
    isUniqueEmail: true,
    isUpdate: false
  };

  const schema = employeeEmploymentDetailsValidation(context, translator);

  it("should reject invalid email format", async () => {
    const invalidData = {
      employeeNumber: "EMP123",
      workEmail: "invalid-email"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow();
  });
});

describe("Entitlements Details Validation", () => {
  const leaveTypesList = [
    {
      value: "1",
      label: "Full Day",
      leaveDuration: LeaveDurationTypes.FULL_DAY
    },
    {
      value: "2",
      label: "Half Day",
      leaveDuration: LeaveDurationTypes.HALF_DAY
    }
  ];
  const schema = employeeEntitlementsDetailsValidation(
    leaveTypesList,
    translator
  );

  it("should validate valid entitlements", async () => {
    const validData = {
      year: "2024",
      leaveType: "1",
      numDays: 10,
      effectiveFrom: "2024-01-01",
      expirationDate: "2024-12-31"
    };
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should reject invalid number of days", async () => {
    const invalidData = {
      year: "2024",
      leaveType: "1",
      numDays: 366,
      effectiveFrom: "2024-01-01"
    };
    await expect(schema.validate(invalidData)).rejects.toThrow();
  });

  it("should validate half-day duration for appropriate leave types", async () => {
    const data = {
      year: "2024",
      leaveType: "2",
      numDays: 10.5,
      effectiveFrom: "2024-01-01"
    };
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });
});

describe("Career Details Validation", () => {
  const schema = employeeCareerDetailsValidation(translator);

  it("should validate valid career details with current position", async () => {
    const validData = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: true
    };
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should reject missing employeeType", async () => {
    const data = {
      employeeType: "",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: true
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject missing jobFamily", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: true
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject missing jobTitle", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "",
      startDate: new Date("2024-01-01"),
      currentPosition: true
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should require endDate when currentPosition is false", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: false,
      endDate: null
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should accept endDate when currentPosition is false", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: false,
      endDate: new Date("2025-01-01")
    };
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("should reject endDate equal to startDate", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: false,
      endDate: new Date("2024-01-01")
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject endDate before startDate", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-06-01"),
      currentPosition: false,
      endDate: new Date("2024-01-01")
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should not require endDate when currentPosition is true", async () => {
    const data = {
      employeeType: "Contract",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer",
      startDate: new Date("2024-01-01"),
      currentPosition: true,
      endDate: null
    };
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });
});

describe("Social Media Details Validation", () => {
  const schema = employeeSocialMediaDetailsValidation(translator);

  it("should validate valid social media URLs", async () => {
    const validData = {
      linkedIn: "https://linkedin.com/in/johndoe",
      x: "https://x.com/johndoe",
      facebook: "https://facebook.com/johndoe",
      instagram: "https://instagram.com/johndoe"
    };
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should accept all null/empty social media fields", async () => {
    const data = {
      linkedIn: null,
      x: null,
      facebook: null,
      instagram: null
    };
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("should reject invalid LinkedIn URL", async () => {
    const data = {
      linkedIn: "not-a-url",
      x: null,
      facebook: null,
      instagram: null
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject invalid X/Twitter URL", async () => {
    const data = {
      linkedIn: null,
      x: "not-a-url",
      facebook: null,
      instagram: null
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });
});

describe("Quick Add Employee Validation", () => {
  const schema = quickAddEmployeeValidations(translator);

  it("should validate a complete valid quick add payload", async () => {
    const validData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com"
    };
    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should reject when firstName is missing", async () => {
    const data = { firstName: "", lastName: "Doe", email: "test@example.com" };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject when lastName is missing", async () => {
    const data = {
      firstName: "Jane",
      lastName: "",
      email: "test@example.com"
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject when email is missing", async () => {
    const data = { firstName: "Jane", lastName: "Doe", email: "" };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject an invalid email format", async () => {
    const data = {
      firstName: "Jane",
      lastName: "Doe",
      email: "not-an-email"
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject email without domain", async () => {
    const data = {
      firstName: "Jane",
      lastName: "Doe",
      email: "user@"
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject firstName exceeding max length (50 chars)", async () => {
    const data = {
      firstName: "A".repeat(51),
      lastName: "Doe",
      email: "test@example.com"
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should reject lastName exceeding max length (50 chars)", async () => {
    const data = {
      firstName: "Jane",
      lastName: "B".repeat(51),
      email: "test@example.com"
    };
    await expect(schema.validate(data)).rejects.toThrow();
  });

  it("should accept firstName at exactly max length (50 chars)", async () => {
    const data = {
      firstName: "A".repeat(50),
      lastName: "Doe",
      email: "test@example.com"
    };
    await expect(schema.validate(data)).resolves.toBeTruthy();
  });

  it("should trim whitespace from email", async () => {
    const data = {
      firstName: "Jane",
      lastName: "Doe",
      email: "  jane@example.com  "
    };
    const result = await schema.validate(data);
    expect(result.email).toBe("jane@example.com");
  });

  it("should reject when all fields are empty", async () => {
    const data = { firstName: "", lastName: "", email: "" };
    await expect(schema.validate(data)).rejects.toThrow();
  });
});
