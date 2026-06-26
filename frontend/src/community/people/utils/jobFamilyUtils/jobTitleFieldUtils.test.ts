import { FormikErrors } from "formik";
import { ChangeEvent, KeyboardEvent } from "react";

import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AddJobFamilyFormType,
  JobTitleType
} from "~community/people/types/JobFamilyTypes";
import {
  getJobTitleNameError,
  handleBinIconBtnClick,
  handleCloseIconBtnClick,
  handleEditIconBtnClick,
  handleJobTitleAddBtnClick,
  handleJobTitleFieldKeyDown,
  handleJobTitleInputChange,
  handleJobTitleNameChange,
  handleTickIconBtnClick
} from "~community/people/utils/jobFamilyUtils/jobTitleFieldUtils";
import { getEmployeesWithJobTitle } from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

jest.mock("./jobTitleUtils.ts", () => ({
  getEmployeesWithJobTitle: jest.fn()
}));
describe("handleJobTitleInputChange", () => {
  it("should format the job title input correctly", () => {
    const event = {
      target: { value: "Test@Job3" }
    } as ChangeEvent<HTMLInputElement>;
    const setFieldValue = jest.fn();

    handleJobTitleInputChange(event, setFieldValue);

    expect(setFieldValue).toHaveBeenCalledWith("jobTitleInput", "TestJob");
  });
});

describe("getJobTitleNameError", () => {
  it("should return the correct error message", () => {
    const errors: FormikErrors<AddJobFamilyFormType> = {
      jobTitles: [{ name: "Error message" }]
    };

    const error = getJobTitleNameError(errors, 0);

    expect(error).toBe("Error message");
  });

  it("should return an empty string if no error exists", () => {
    const errors: FormikErrors<AddJobFamilyFormType> = {};

    const error = getJobTitleNameError(errors, 0);

    expect(error).toBe("");
  });
});

describe("handleJobTitleNameChange", () => {
  it("should format the job title name correctly", () => {
    const event = {
      target: { value: "Test@Job" }
    } as ChangeEvent<HTMLInputElement>;
    const setFieldValue = jest.fn();
    const setFieldError = jest.fn();

    handleJobTitleNameChange(event, 0, setFieldValue, setFieldError);

    expect(setFieldValue).toHaveBeenCalledWith("jobTitles.0.name", "Test Job");
  });
});

describe("handleJobTitleAddBtnClick", () => {
  let mockSetFieldValue: jest.Mock;
  let mockSetFieldError: jest.Mock;

  beforeEach(() => {
    mockSetFieldValue = jest.fn();
    mockSetFieldError = jest.fn();
  });

  it("should add a job title and clear the input", async () => {
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "Software Engineer",
      jobTitles: []
    };

    await handleJobTitleAddBtnClick(
      values,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockSetFieldError).toHaveBeenCalledWith("jobTitleInput", "");
    expect(mockSetFieldValue).toHaveBeenCalledWith("jobTitleInput", "");
    expect(mockSetFieldValue).toHaveBeenCalledWith("jobTitles", [
      { jobTitleId: null, name: "Software Engineer" }
    ]);
  });

  it("should not add a job title when input is empty", async () => {
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "",
      jobTitles: []
    };

    await handleJobTitleAddBtnClick(
      values,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockSetFieldValue).not.toHaveBeenCalledWith("jobTitles", []);
    expect(mockSetFieldValue).toHaveBeenCalledTimes(0);
  });
});

describe("handleJobTitleFieldKeyDown", () => {
  let mockSetFieldValue: jest.Mock;
  let mockSetFieldError: jest.Mock;

  beforeEach(() => {
    mockSetFieldValue = jest.fn();
    mockSetFieldError = jest.fn();
  });

  it("should call handleJobTitleAddBtnClick on Enter key", async () => {
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "Product Manager",
      jobTitles: []
    };

    const mockEvent = {
      key: "Enter",
      preventDefault: jest.fn()
    } as unknown as KeyboardEvent<HTMLInputElement>;

    await handleJobTitleFieldKeyDown(
      mockEvent,
      values,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockSetFieldError).toHaveBeenCalledWith("jobTitleInput", "");
    expect(mockSetFieldValue).toHaveBeenCalledWith("jobTitles", [
      { jobTitleId: null, name: "Product Manager" }
    ]);
    expect(mockSetFieldValue).toHaveBeenCalledWith("jobTitleInput", "");
  });

  it("should not call handleJobTitleAddBtnClick on non-Enter key", async () => {
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitleInput: "Designer",
      jobTitles: []
    };

    const mockEvent = {
      key: "Tab",
      preventDefault: jest.fn()
    } as unknown as KeyboardEvent<HTMLInputElement>;

    await handleJobTitleFieldKeyDown(
      mockEvent,
      values,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockSetFieldError).not.toHaveBeenCalled();
    expect(mockSetFieldValue).not.toHaveBeenCalled();
  });
});

describe("handleEditIconBtnClick", () => {
  it("should set the editing state correctly", () => {
    const jobTitle: JobTitleType = { jobTitleId: 1, name: "Job Title" };
    const setEditingInputField = jest.fn();
    const setPreviousJobTitleData = jest.fn();

    handleEditIconBtnClick(
      jobTitle,
      setEditingInputField,
      0,
      setPreviousJobTitleData
    );

    expect(setEditingInputField).toHaveBeenCalledWith(0);
    expect(setPreviousJobTitleData).toHaveBeenCalledWith(jobTitle);
  });
});

describe("handleBinIconBtnClick", () => {
  const createMockData = (
    options: {
      jobTitlesCount?: number;
      jobTitleIdIsNull?: boolean;
      employeesCount?: number;
    } = {}
  ) => {
    const {
      jobTitlesCount = 1,
      jobTitleIdIsNull = true,
      employeesCount = 0
    } = options;

    const createJobTitle = (index: number) => ({
      jobTitleId: jobTitleIdIsNull ? null : index + 1,
      name: `Job Title ${index + 1}`
    });

    const jobTitles = Array(jobTitlesCount)
      .fill(0)
      .map((_, index) => createJobTitle(index));

    return {
      jobTitle: jobTitles[0],
      setPreviousJobTitleData: jest.fn(),
      setFieldValue: jest.fn(),
      setJobFamilyModalType: jest.fn(),
      values: {
        jobFamilyId: 1,
        name: "Job Family",
        jobTitleInput: "New Job Title",
        jobTitles: jobTitles
      },
      allJobFamilies: [],
      jobFamilyId: 1,
      currentEditingJobFamily: {
        jobFamilyId: 1,
        name: "Job Family",
        jobTitles: jobTitles
      },
      employeesCount
    };
  };

  it("should not remove the job title and not set the modal type when there's only one job title with null jobTitleId", async () => {
    const mockData = createMockData({
      jobTitlesCount: 1,
      jobTitleIdIsNull: true
    });
    (getEmployeesWithJobTitle as jest.Mock).mockReturnValue([]);

    await handleBinIconBtnClick(
      mockData.jobTitle,
      mockData.setPreviousJobTitleData,
      mockData.setFieldValue,
      mockData.values,
      mockData.allJobFamilies,
      mockData.setJobFamilyModalType
    );

    expect(mockData.setPreviousJobTitleData).not.toHaveBeenCalledWith(
      mockData.jobTitle
    );
    expect(mockData.setFieldValue).not.toHaveBeenCalledWith("jobTitles", []);
    expect(mockData.setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.ADD_NEW_JOB_TITLE
    );
  });

  it("should set modal type to ADD_NEW_JOB_TITLE when there's only one job title with employees", async () => {
    const mockData = createMockData({
      jobTitlesCount: 1,
      jobTitleIdIsNull: false,
      employeesCount: 2
    });
    (getEmployeesWithJobTitle as jest.Mock).mockReturnValue(
      Array(mockData.employeesCount).fill({})
    );

    await handleBinIconBtnClick(
      mockData.jobTitle,
      mockData.setPreviousJobTitleData,
      mockData.setFieldValue,
      mockData.values,
      mockData.allJobFamilies,
      mockData.setJobFamilyModalType
    );

    expect(mockData.setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.ADD_NEW_JOB_TITLE
    );
  });

  it("should set modal type to JOB_TITLE_DELETION_WARNING when there are multiple job titles with employees", async () => {
    const mockData = createMockData({
      jobTitlesCount: 2,
      jobTitleIdIsNull: false,
      employeesCount: 1
    });
    (getEmployeesWithJobTitle as jest.Mock).mockReturnValue(
      Array(mockData.employeesCount).fill({})
    );

    await handleBinIconBtnClick(
      mockData.jobTitle,
      mockData.setPreviousJobTitleData,
      mockData.setFieldValue,
      mockData.values,
      mockData.allJobFamilies,
      mockData.setJobFamilyModalType
    );

    expect(mockData.setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_TITLE_DELETION_WARNING
    );
  });
});

describe("handleTickIconBtnClick", () => {
  it("should update the job title and set the modal type correctly", async () => {
    const index = 0;
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitleInput: "New Job Title",
      jobTitles: [{ jobTitleId: 1, name: "Updated Job Title" }]
    };
    const previousJobTitleData: JobTitleType | null = {
      jobTitleId: 1,
      name: "Job Title"
    };
    const setFieldValue = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setEditingInputField = jest.fn();

    await handleTickIconBtnClick(
      index,
      values,
      previousJobTitleData,
      [],
      setFieldValue,
      setJobFamilyModalType,
      setEditingInputField
    );

    expect(setFieldValue).toHaveBeenCalledWith("jobTitles.0", {
      jobTitleId: 1,
      name: "Updated Job Title"
    });
    expect(setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_TITLE_EDIT_CONFIRMATION
    );
    expect(setEditingInputField).toHaveBeenCalledWith(null);
  });

  it("should not set the modal type if job title name has not changed", async () => {
    const index = 0;
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitleInput: "New Job Title",
      jobTitles: [{ jobTitleId: 1, name: "Job Title" }]
    };
    const previousJobTitleData: JobTitleType | null = {
      jobTitleId: 1,
      name: "Job Title"
    };
    const setFieldValue = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setEditingInputField = jest.fn();

    await handleTickIconBtnClick(
      index,
      values,
      previousJobTitleData,
      [],
      setFieldValue,
      setJobFamilyModalType,
      setEditingInputField
    );

    expect(setFieldValue).not.toHaveBeenCalled();
    expect(setJobFamilyModalType).not.toHaveBeenCalled();
    expect(setEditingInputField).not.toHaveBeenCalledWith(null);
  });

  it("should handle case when previousJobTitleData is null", async () => {
    const index = 0;
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitleInput: "New Job Title",
      jobTitles: [{ jobTitleId: 1, name: "Updated Job Title" }]
    };
    const previousJobTitleData: JobTitleType | null = null;
    const setFieldValue = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setEditingInputField = jest.fn();

    await handleTickIconBtnClick(
      index,
      values,
      previousJobTitleData,
      [],
      setFieldValue,
      setJobFamilyModalType,
      setEditingInputField
    );

    expect(setFieldValue).not.toHaveBeenCalledWith("jobTitles.0", {
      jobTitleId: 1,
      name: "Updated Job Title"
    });
    expect(setJobFamilyModalType).not.toHaveBeenCalled();
    expect(setEditingInputField).not.toHaveBeenCalledWith(null);
  });

  it("should set the modal type to JOB_TITLE_EDIT_CONFIRMATION if there are employees with the previous job title", async () => {
    const index = 0;
    const values: AddJobFamilyFormType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitleInput: "New Job Title",
      jobTitles: [{ jobTitleId: 1, name: "Updated Job Title" }]
    };
    const previousJobTitleData: JobTitleType | null = {
      jobTitleId: 1,
      name: "Job Title"
    };
    const setFieldValue = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setEditingInputField = jest.fn();

    (getEmployeesWithJobTitle as jest.Mock).mockReturnValue([{}]);

    await handleTickIconBtnClick(
      index,
      values,
      previousJobTitleData,
      [],
      setFieldValue,
      setJobFamilyModalType,
      setEditingInputField
    );

    expect(setFieldValue).toHaveBeenCalledWith("jobTitles.0", {
      jobTitleId: 1,
      name: "Updated Job Title"
    });
    expect(setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_TITLE_EDIT_CONFIRMATION
    );
    expect(setEditingInputField).toHaveBeenCalledWith(null);
  });
});

describe("handleCloseIconBtnClick", () => {
  it("should revert the job title to the previous value", () => {
    const index = 0;
    const previousJobTitleData: JobTitleType | null = {
      jobTitleId: 1,
      name: "Previous Job Title"
    };
    const setFieldValue = jest.fn();
    const setPreviousJobTitleData = jest.fn();
    const setEditingInputField = jest.fn();

    handleCloseIconBtnClick(
      index,
      previousJobTitleData,
      setFieldValue,
      setPreviousJobTitleData,
      setEditingInputField
    );

    expect(setFieldValue).toHaveBeenCalledWith(
      "jobTitles.0.name",
      "Previous Job Title"
    );
    expect(setPreviousJobTitleData).toHaveBeenCalledWith(null);
    expect(setEditingInputField).toHaveBeenCalledWith(null);
  });
});
