import {
  TitleSelector,
  BloodGroupSelector,
  AllocationSelector,
  EeoSelector,
  EthnicitySelector,
  replaceEmptyStringsWithNull,
  convertUserBulkCsvHeaders
} from "./userBulkUploadUtils";

jest.mock("~community/people/enums/PeopleEnums", () => ({
  TitleEnum: { MR: "MR", MRS: "MRS", MISS: "MISS" }
}));

jest.mock("~community/people/types/AddNewResourceTypes", () => ({
  BloodGroupTypes: {
    A_POSITIVE: "A_POSITIVE",
    A_NEGATIVE: "A_NEGATIVE",
    B_POSITIVE: "B_POSITIVE",
    B_NEGATIVE: "B_NEGATIVE",
    O_POSITIVE: "O_POSITIVE",
    O_NEGATIVE: "O_NEGATIVE",
    AB_POSITIVE: "AB_POSITIVE",
    AB_NEGATIVE: "AB_NEGATIVE"
  },
  EEOJobCategoryTypes: {
    EXECUTIVE: "EXECUTIVE",
    FIRST_MID_LEVEL: "FIRST_MID_LEVEL",
    PROFESSIONALS: "PROFESSIONALS",
    TECHNICIANS: "TECHNICIANS",
    SALES_WORKERS: "SALES_WORKERS",
    SUPPORT_WORKERS: "SUPPORT_WORKERS",
    CRAFT_WORKERS: "CRAFT_WORKERS",
    OPERATIVES: "OPERATIVES",
    LABORERS: "LABORERS",
    SERVICE_WORKERS: "SERVICE_WORKERS"
  },
  EmploymentAllocationTypes: {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME"
  },
  EthnicityTypes: {
    AFRICAN: "AFRICAN",
    CARIBBEAN: "CARIBBEAN",
    INDIAN: "INDIAN",
    MELANESIAN: "MELANESIAN",
    AUSTRALASIAN_OR_ABORIGINAL: "AUSTRALASIAN_OR_ABORIGINAL",
    CHINESE: "CHINESE",
    GUAMANIAN: "GUAMANIAN",
    JAPANESE: "JAPANESE",
    KOREAN: "KOREAN",
    POLYNESIAN: "POLYNESIAN",
    EUROPEAN_OR_ANGLO_SAXON: "EUROPEAN_OR_ANGLO_SAXON",
    OTHER_PACIFIC_ISLANDER: "OTHER_PACIFIC_ISLANDER",
    LATIN_AMERICAN: "LATIN_AMERICAN",
    ARABIC: "ARABIC",
    VIETNAMESE: "VIETNAMESE",
    MICRONESIAN: "MICRONESIAN",
    DECLINED_TO_RESPOND: "DECLINED_TO_RESPOND",
    OTHER_HISPANIC: "OTHER_HISPANIC",
    US_OR_CANADIAN_INDIAN: "US_OR_CANADIAN_INDIAN",
    OTHER_ASIAN: "OTHER_ASIAN",
    PUERTO_RICAN: "PUERTO_RICAN",
    FILIPINO: "FILIPINO",
    MEXICAN: "MEXICAN",
    ALASKAN_NATIVE: "ALASKAN_NATIVE",
    CUBAN: "CUBAN"
  }
}));

describe("userBulkUploadUtils", () => {
  describe("TitleSelector", () => {
    it("should map 'Mr' to MR", () => {
      expect(TitleSelector["Mr"]).toBe("MR");
    });

    it("should map 'Mrs' to MRS", () => {
      expect(TitleSelector["Mrs"]).toBe("MRS");
    });

    it("should map 'Miss' to MISS", () => {
      expect(TitleSelector["Miss"]).toBe("MISS");
    });
  });

  describe("BloodGroupSelector", () => {
    it("should map all 8 blood groups", () => {
      expect(Object.keys(BloodGroupSelector)).toHaveLength(8);
    });

    it("should map '(A+)' to A_POSITIVE", () => {
      expect(BloodGroupSelector["(A+)"]).toBe("A_POSITIVE");
    });

    it("should map '(O-)' to O_NEGATIVE", () => {
      expect(BloodGroupSelector["(O-)"]).toBe("O_NEGATIVE");
    });
  });

  describe("AllocationSelector", () => {
    it("should map 'Full Time' to FULL_TIME", () => {
      expect(AllocationSelector["Full Time"]).toBe("FULL_TIME");
    });

    it("should map 'Part Time' to PART_TIME", () => {
      expect(AllocationSelector["Part Time"]).toBe("PART_TIME");
    });
  });

  describe("EeoSelector", () => {
    it("should map all 10 EEO categories", () => {
      expect(Object.keys(EeoSelector)).toHaveLength(10);
    });
  });

  describe("EthnicitySelector", () => {
    it("should map all 25 ethnicities", () => {
      expect(Object.keys(EthnicitySelector)).toHaveLength(25);
    });
  });

  describe("replaceEmptyStringsWithNull", () => {
    it("should replace empty strings with null", () => {
      const result = replaceEmptyStringsWithNull({ name: "", age: "25" });
      expect(result.name).toBeNull();
      expect(result.age).toBe("25");
    });

    it("should handle nested objects", () => {
      const result = replaceEmptyStringsWithNull({
        person: { name: "", city: "NY" }
      });
      expect(result.person.name).toBeNull();
      expect(result.person.city).toBe("NY");
    });

    it("should not modify non-string values", () => {
      const result = replaceEmptyStringsWithNull({
        count: 0,
        active: false,
        data: null
      });
      expect(result.count).toBe(0);
      expect(result.active).toBe(false);
      expect(result.data).toBeNull();
    });

    it("should not replace non-empty strings", () => {
      const result = replaceEmptyStringsWithNull({ name: "John" });
      expect(result.name).toBe("John");
    });
  });

  describe("convertUserBulkCsvHeaders", () => {
    it("should convert 'First name*' to 'firstName'", () => {
      expect(convertUserBulkCsvHeaders("First name*")).toBe("firstName");
    });

    it("should convert 'Last name*' to 'lastName'", () => {
      expect(convertUserBulkCsvHeaders("Last name*")).toBe("lastName");
    });

    it("should convert 'Work Email*' to 'workEmail'", () => {
      expect(convertUserBulkCsvHeaders("Work Email*")).toBe("workEmail");
    });

    it("should convert 'Joined Date' to 'joinedDate'", () => {
      expect(convertUserBulkCsvHeaders("Joined Date")).toBe("joinedDate");
    });

    it("should convert 'Primary Supervisor(Email)' to 'primaryManager'", () => {
      expect(convertUserBulkCsvHeaders("Primary Supervisor(Email)")).toBe(
        "primaryManager"
      );
    });

    it("should convert 'X(Twitter)' to 'x'", () => {
      expect(convertUserBulkCsvHeaders("X(Twitter)")).toBe("x");
    });

    it("should return the original header when not found in mapping", () => {
      expect(convertUserBulkCsvHeaders("Unknown Header")).toBe(
        "Unknown Header"
      );
    });

    it("should convert 'Emergency Contact Name' to 'name'", () => {
      expect(convertUserBulkCsvHeaders("Emergency Contact Name")).toBe("name");
    });

    it("should convert 'Employment Allocation' to 'employmentAllocation'", () => {
      expect(convertUserBulkCsvHeaders("Employment Allocation")).toBe(
        "employmentAllocation"
      );
    });
  });
});
