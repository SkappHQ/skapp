import {
  AllJobFamilyType,
  JobFamilyEmployeeDataType,
  JobTitleType
} from "~community/people/types/JobFamilyTypes";
import {
  getEmployeeDetails,
  getJobTitlesWithJobFamilyId,
  sortJobFamilyArrayInAscendingOrder,
  sortJobTitlesArrayInAscendingOrder
} from "~community/people/utils/jobFamilyUtils/commonUtils";

describe("sortJobFamilyArrayInAscendingOrder", () => {
  it("should sort job families in ascending order by jobFamilyId", () => {
    const jobFamilies: AllJobFamilyType[] = [
      { jobFamilyId: 3, name: "Design", jobTitles: [], employees: [] },
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Marketing", jobTitles: [], employees: [] }
    ];

    const result = sortJobFamilyArrayInAscendingOrder(jobFamilies);

    expect(result).toEqual([
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Marketing", jobTitles: [], employees: [] },
      { jobFamilyId: 3, name: "Design", jobTitles: [], employees: [] }
    ]);
  });

  it("should return an empty array if input is null", () => {
    const result = sortJobFamilyArrayInAscendingOrder(null);

    expect(result).toEqual([]);
  });

  it("should handle an empty array input", () => {
    const result = sortJobFamilyArrayInAscendingOrder([]);

    expect(result).toEqual([]);
  });
});

describe("sortJobTitlesArrayInAscendingOrder", () => {
  it("should sort job titles in ascending order by jobTitleId", () => {
    const jobTitles: JobTitleType[] = [
      { jobTitleId: 3, name: "Manager" },
      { jobTitleId: 1, name: "Developer" },
      { jobTitleId: 2, name: "Tester" }
    ];

    const result = sortJobTitlesArrayInAscendingOrder(jobTitles);

    expect(result).toEqual([
      { jobTitleId: 1, name: "Developer" },
      { jobTitleId: 2, name: "Tester" },
      { jobTitleId: 3, name: "Manager" }
    ]);
  });

  it("should return an empty array if input is null", () => {
    const result = sortJobTitlesArrayInAscendingOrder(null);

    expect(result).toEqual([]);
  });

  it("should handle an empty array input", () => {
    const result = sortJobTitlesArrayInAscendingOrder([]);

    expect(result).toEqual([]);
  });
});

describe("getEmployeeDetails", () => {
  it("should return the correct employee details", () => {
    const employeeId = 1;
    const employees: JobFamilyEmployeeDataType[] = [
      {
        employeeId: 1,
        lastName: "Doe",
        jobFamily: "Engineering",
        jobTitle: "Developer"
      },
      {
        employeeId: 2,
        lastName: "Smith",
        jobFamily: "Design",
        jobTitle: "UI Designer"
      }
    ];

    const result = getEmployeeDetails(employeeId, employees);

    expect(result).toEqual({
      employeeId: 1,
      lastName: "Doe",
      jobFamily: "Engineering",
      jobTitle: "Developer"
    });
  });

  it("should return undefined for non-existent employee", () => {
    const employeeId = 3;
    const employees: JobFamilyEmployeeDataType[] = [
      {
        employeeId: 1,
        lastName: "Doe",
        jobFamily: "Engineering",
        jobTitle: "Developer"
      },
      {
        employeeId: 2,
        lastName: "Smith",
        jobFamily: "Design",
        jobTitle: "UI Designer"
      }
    ];

    const result = getEmployeeDetails(employeeId, employees);

    expect(result).toBeUndefined();
  });
});

describe("getJobTitlesWithJobFamilyId", () => {
  it("should return job titles for the given job family id when jobFamilyTransfer is true", () => {
    const jobFamilyTransfer = true;
    const jobFamilyId = 1;
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [
          { jobTitleId: 1, name: "Developer" },
          { jobTitleId: 2, name: "Tester" }
        ],
        employees: []
      }
    ];

    const result = getJobTitlesWithJobFamilyId(
      jobFamilyTransfer,
      allJobFamilies,
      jobFamilyId
    );

    expect(result).toEqual([
      { jobTitleId: 1, name: "Developer" },
      { jobTitleId: 2, name: "Tester" }
    ]);
  });

  it("should return filtered job titles excluding the given job title id when jobFamilyTransfer is false", () => {
    const jobFamilyTransfer = false;
    const jobFamilyId = 1;
    const jobTitleId = 1;
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [
          { jobTitleId: 1, name: "Developer" },
          { jobTitleId: 2, name: "Tester" }
        ],
        employees: []
      }
    ];

    const result = getJobTitlesWithJobFamilyId(
      jobFamilyTransfer,
      allJobFamilies,
      jobFamilyId,
      jobTitleId
    );

    expect(result).toEqual([{ jobTitleId: 2, name: "Tester" }]);
  });

  it("should return an empty array if job family is not found", () => {
    const jobFamilyTransfer = true;
    const jobFamilyId = 2;
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [
          { jobTitleId: 1, name: "Developer" },
          { jobTitleId: 2, name: "Tester" }
        ],
        employees: []
      }
    ];

    const result = getJobTitlesWithJobFamilyId(
      jobFamilyTransfer,
      allJobFamilies,
      jobFamilyId
    );

    expect(result).toEqual([]);
  });
});
