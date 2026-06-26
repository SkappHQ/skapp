import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { AllJobFamilyType } from "~community/people/types/JobFamilyTypes";
import {
  handleJobFamilyDeleteBtnClick,
  handleJobFamilyEditBtnClick
} from "~community/people/utils/jobFamilyUtils/jobFamilyTableUtils";

describe("handleJobFamilyEditBtnClick", () => {
  it("should set the current editing job family and modal type correctly", () => {
    const mockJobFamilyData: AllJobFamilyType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [{ jobTitleId: 1, name: "Software Engineer" }],
      employees: [
        { employeeId: 1, lastName: "Doe", jobTitle: "Software Engineer" }
      ]
    };

    const mockSetCurrentEditingJobFamily = jest.fn();
    const mockSetJobFamilyModalType = jest.fn();

    handleJobFamilyEditBtnClick(
      mockJobFamilyData,
      mockSetCurrentEditingJobFamily,
      mockSetJobFamilyModalType
    );

    // Check if setCurrentEditingJobFamily was called with the correct data
    expect(mockSetCurrentEditingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [{ jobTitleId: 1, name: "Software Engineer" }]
    });

    // Check if setJobFamilyModalType was called with the correct enum
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
  });

  it("should not include employees in the current editing job family", () => {
    const mockJobFamilyData: AllJobFamilyType = {
      jobFamilyId: 2,
      name: "Marketing",
      jobTitles: [{ jobTitleId: 2, name: "Marketing Manager" }],
      employees: [
        { employeeId: 2, lastName: "Smith", jobTitle: "Marketing Manager" },
        { employeeId: 3, lastName: "Johnson", jobTitle: "Marketing Specialist" }
      ]
    };

    const mockSetCurrentEditingJobFamily = jest.fn();
    const mockSetJobFamilyModalType = jest.fn();

    handleJobFamilyEditBtnClick(
      mockJobFamilyData,
      mockSetCurrentEditingJobFamily,
      mockSetJobFamilyModalType
    );

    // Check if setCurrentEditingJobFamily was called with the correct data, excluding employees
    expect(mockSetCurrentEditingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 2,
      name: "Marketing",
      jobTitles: [{ jobTitleId: 2, name: "Marketing Manager" }]
    });

    // Ensure that the employees array is not included in the call
    expect(mockSetCurrentEditingJobFamily).not.toHaveBeenCalledWith(
      expect.objectContaining({ employees: expect.anything() })
    );
  });
});

describe("handleJobFamilyDeleteBtnClick", () => {
  const mockSetCurrentDeletingJobFamily = jest.fn();
  const mockSetJobFamilyModalType = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set JOB_FAMILY_DELETE_CONFIRMATION modal type when there are no employees", () => {
    const mockAllJobFamilies: AllJobFamilyType[] = [
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Marketing", jobTitles: [], employees: [] }
    ];
    const mockJobFamilyData: AllJobFamilyType = mockAllJobFamilies[0];

    handleJobFamilyDeleteBtnClick(
      mockAllJobFamilies,
      mockJobFamilyData,
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      employees: []
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_FAMILY_DELETE_CONFIRMATION
    );
  });

  it("should set ADD_NEW_JOB_FAMILY modal type when there is only one job family with employees", () => {
    const mockAllJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          { employeeId: 1, lastName: "Doe", jobTitle: "Software Engineer" }
        ]
      }
    ];
    const mockJobFamilyData: AllJobFamilyType = mockAllJobFamilies[0];

    handleJobFamilyDeleteBtnClick(
      mockAllJobFamilies,
      mockJobFamilyData,
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      employees: mockJobFamilyData.employees
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.ADD_NEW_JOB_FAMILY
    );
  });

  it("should set JOB_FAMILY_DELETION_WARNING modal type when there are multiple job families and employees", () => {
    const mockAllJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          { employeeId: 1, lastName: "Doe", jobTitle: "Software Engineer" }
        ]
      },
      { jobFamilyId: 2, name: "Marketing", jobTitles: [], employees: [] }
    ];
    const mockJobFamilyData: AllJobFamilyType = mockAllJobFamilies[0];

    handleJobFamilyDeleteBtnClick(
      mockAllJobFamilies,
      mockJobFamilyData,
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      employees: mockJobFamilyData.employees
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING
    );
  });

  it("should handle job family data with undefined employees", () => {
    const mockAllJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: undefined as any
      },
      { jobFamilyId: 2, name: "Marketing", jobTitles: [], employees: [] }
    ];
    const mockJobFamilyData: AllJobFamilyType = mockAllJobFamilies[0];

    handleJobFamilyDeleteBtnClick(
      mockAllJobFamilies,
      mockJobFamilyData,
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      employees: []
    });
    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_FAMILY_DELETE_CONFIRMATION
    );
  });
});
