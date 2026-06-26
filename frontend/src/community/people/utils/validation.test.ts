import {
  AllJobFamilyType,
  JobFamilyEmployeeDataType
} from "~community/people/types/JobFamilyTypes";

import { addEditJobFamilyValidationSchema } from "./validation";

const translator = (suffixes: string[]) => suffixes[0];

describe("Job Family Validation Schema", () => {
  const mockEmployees: JobFamilyEmployeeDataType[] = [
    {
      employeeId: 1,
      firstName: "John",
      lastName: "Doe",
      avatarUrl: "avatar1.jpg",
      authPic: "auth1.jpg",
      jobFamily: "Engineering",
      jobTitle: "Software Engineer"
    },
    {
      employeeId: 2,
      firstName: "Jane",
      lastName: "Smith",
      avatarUrl: "avatar2.jpg",
      authPic: "auth2.jpg",
      jobFamily: "Design",
      jobTitle: "UI Designer"
    }
  ];

  const mockJobFamilies: AllJobFamilyType[] = [
    {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [
        { jobTitleId: 1, name: "Software Engineer" },
        { jobTitleId: 2, name: "Senior Engineer" }
      ],
      employees: [mockEmployees[0]]
    },
    {
      jobFamilyId: 2,
      name: "Design",
      jobTitles: [{ jobTitleId: 3, name: "UI Designer" }],
      employees: [mockEmployees[1]]
    }
  ];

  const schema = addEditJobFamilyValidationSchema(mockJobFamilies, translator);

  it("should validate valid job family data", async () => {
    const validData = {
      name: "Marketing",
      jobTitleInput: "",
      jobTitles: [{ jobTitleId: null, name: "Marketing Manager" }]
    };

    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should reject duplicate job family name", async () => {
    const invalidData = {
      name: "Engineering",
      jobTitleInput: "",
      jobTitles: [{ jobTitleId: null, name: "New Role" }]
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "jobFamilyDuplicatedError"
    );
  });

  it("should allow updating existing job family", async () => {
    const updateData = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "",
      jobTitles: [{ jobTitleId: 1, name: "Software Engineer" }]
    };

    await expect(schema.validate(updateData)).resolves.toBeTruthy();
  });

  it("should validate case-insensitive name uniqueness", async () => {
    const invalidData = {
      name: "ENGINEERING",
      jobTitleInput: "",
      jobTitles: [{ jobTitleId: null, name: "New Role" }]
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "jobFamilyDuplicatedError"
    );
  });

  it("should allow adding new job titles to existing family", async () => {
    const validData = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "",
      jobTitles: [
        { jobTitleId: 1, name: "Software Engineer" },
        { jobTitleId: null, name: "DevOps Engineer" }
      ]
    };

    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });

  it("should validate unique job titles within same family", async () => {
    const invalidData = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "",
      jobTitles: [
        { jobTitleId: 1, name: "Software Engineer" },
        { jobTitleId: null, name: "Software Engineer" }
      ]
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "jobTitleDuplicatedError"
    );
  });

  it("should trim whitespace from names", async () => {
    const validData = {
      name: "  Marketing  ",
      jobTitleInput: "",
      jobTitles: [{ jobTitleId: null, name: "  Marketing Manager  " }]
    };

    const validated = await schema.validate(validData);
    expect(validated.name).toBe("marketing");
    expect(validated.jobTitles?.[0]?.name).toBe("marketing manager");
  });

  it("should handle family with existing employees", async () => {
    const validData = {
      jobFamilyId: 1,
      name: "Engineering Updated",
      jobTitleInput: "",
      jobTitles: [
        { jobTitleId: 1, name: "Software Engineer" },
        { jobTitleId: 2, name: "Senior Engineer" }
      ]
    };

    await expect(schema.validate(validData)).resolves.toBeTruthy();
  });
});
