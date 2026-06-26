import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { SetStateAction } from "react";

import { ToastProps } from "~community/common/types/ToastTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  EditJobFamilyMutationType,
  JobTitleType,
  TransferMemberFormType,
  TransferMembersWithJobTitleMutationType
} from "~community/people/types/JobFamilyTypes";
import { sortJobTitlesArrayInAscendingOrder } from "~community/people/utils/jobFamilyUtils/commonUtils";

import {
  JobTitleEditConfirmationModalSubmitBtnClick,
  getEmployeesWithJobTitle,
  getJobFamilyDataFromAllJobFamilies,
  handleJobTitleDeleteBackBtnClick,
  handleJobTitleDropDownItemClick,
  handleJobTitleEditBackBtnClick,
  jobTitleTransferMembersModalSubmitBtnClick
} from "./jobTitleUtils";

jest.mock("~community/people/utils/jobFamilyUtils/commonUtils");

describe("getJobFamilyDataFromAllJobFamilies", () => {
  it("should return the correct job family data when jobFamilyId matches", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Human Resources", jobTitles: [], employees: [] }
    ];
    const jobFamilyId = 1;

    const result = getJobFamilyDataFromAllJobFamilies(
      allJobFamilies,
      jobFamilyId
    );

    expect(result).toEqual({
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [],
      employees: []
    });
  });

  it("should return undefined if jobFamilyId does not match any job family", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Human Resources", jobTitles: [], employees: [] }
    ];
    const jobFamilyId = 3;

    const result = getJobFamilyDataFromAllJobFamilies(
      allJobFamilies,
      jobFamilyId
    );

    expect(result).toBeUndefined();
  });

  it("should return undefined if allJobFamilies is null", () => {
    const result = getJobFamilyDataFromAllJobFamilies(null, 1);

    expect(result).toBeUndefined();
  });

  it("should return undefined if jobFamilyId is undefined", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      { jobFamilyId: 1, name: "Engineering", jobTitles: [], employees: [] },
      { jobFamilyId: 2, name: "Human Resources", jobTitles: [], employees: [] }
    ];

    const result = getJobFamilyDataFromAllJobFamilies(
      allJobFamilies,
      undefined
    );

    expect(result).toBeUndefined();
  });
});

describe("getEmployeesWithJobTitle", () => {
  it("should return employees with the specified job title", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          {
            employeeId: 1,
            lastName: "",
            jobTitle: { jobTitleId: 1, name: "Developer" }
          },
          {
            employeeId: 2,
            lastName: "",
            jobTitle: { jobTitleId: 2, name: "Tester" }
          }
        ]
      }
    ];
    const jobFamilyId = 1;
    const jobTitleName = "Developer";

    const result = getEmployeesWithJobTitle(
      allJobFamilies,
      jobFamilyId,
      jobTitleName
    );

    expect(result).toEqual([
      {
        employeeId: 1,
        lastName: "",
        jobTitle: { jobTitleId: 1, name: "Developer" }
      }
    ]);
  });

  it("should return an empty array if no employees have the specified job title", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          {
            employeeId: 1,
            lastName: "",
            jobTitle: { jobTitleId: 1, name: "Developer" }
          },
          {
            employeeId: 2,
            lastName: "",
            jobTitle: { jobTitleId: 2, name: "Tester" }
          }
        ]
      }
    ];
    const jobFamilyId = 1;
    const jobTitleName = "Manager";

    const result = getEmployeesWithJobTitle(
      allJobFamilies,
      jobFamilyId,
      jobTitleName
    );

    expect(result).toEqual([]);
  });

  it("should return an empty array if jobFamilyId does not match any job family", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          {
            employeeId: 1,
            lastName: "",
            jobTitle: { jobTitleId: 1, name: "Developer" }
          },
          {
            employeeId: 2,
            lastName: "",
            jobTitle: { jobTitleId: 2, name: "Tester" }
          }
        ]
      }
    ];
    const jobFamilyId = 2;
    const jobTitleName = "Developer";

    const result = getEmployeesWithJobTitle(
      allJobFamilies,
      jobFamilyId,
      jobTitleName
    );

    expect(result).toEqual([]);
  });

  it("should return an empty array if allJobFamilies is null", () => {
    const result = getEmployeesWithJobTitle(null, 1, "Developer");

    expect(result).toEqual([]);
  });

  it("should return an empty array if jobFamilyData is undefined", () => {
    const allJobFamilies: AllJobFamilyType[] = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [],
        employees: [
          {
            employeeId: 1,
            lastName: "",
            jobTitle: { jobTitleId: 1, name: "Developer" }
          },
          {
            employeeId: 2,
            lastName: "",
            jobTitle: { jobTitleId: 2, name: "Tester" }
          }
        ]
      }
    ];
    const jobFamilyId = 3;
    const jobTitleName = "Developer";

    const result = getEmployeesWithJobTitle(
      allJobFamilies,
      jobFamilyId,
      jobTitleName
    );

    expect(result).toEqual([]);
  });
});

describe("handleJobTitleEditBackBtnClick", () => {
  it("should update the current editing job family and set the modal type", () => {
    const previousJobTitleData: JobTitleType = {
      jobTitleId: 1,
      name: "Developer"
    };
    const currentEditingJobFamily: CurrentEditingJobFamilyType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitles: [{ jobTitleId: 1, name: "Old Title" }]
    };
    const setCurrentEditingJobFamily = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setPreviousJobTitleData = jest.fn();

    (sortJobTitlesArrayInAscendingOrder as jest.Mock).mockReturnValue([
      { jobTitleId: 1, name: "Developer" }
    ]);

    handleJobTitleEditBackBtnClick(
      previousJobTitleData,
      currentEditingJobFamily,
      setCurrentEditingJobFamily,
      setJobFamilyModalType,
      setPreviousJobTitleData
    );

    expect(setCurrentEditingJobFamily).toHaveBeenCalledWith({
      ...currentEditingJobFamily,
      jobTitles: [{ jobTitleId: 1, name: "Developer" }]
    });
    expect(setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
    expect(setPreviousJobTitleData).toHaveBeenCalledWith(null);
  });

  it("should return if previousJobTitleData or currentEditingJobFamily is null", () => {
    const setCurrentEditingJobFamily = jest.fn();
    const setJobFamilyModalType = jest.fn();
    const setPreviousJobTitleData = jest.fn();

    handleJobTitleEditBackBtnClick(
      null,
      null,
      setCurrentEditingJobFamily,
      setJobFamilyModalType,
      setPreviousJobTitleData
    );

    expect(setCurrentEditingJobFamily).not.toHaveBeenCalled();
    expect(setJobFamilyModalType).not.toHaveBeenCalled();
    expect(setPreviousJobTitleData).not.toHaveBeenCalled();
  });
});

describe("handleJobTitleDeleteBackBtnClick", () => {
  it("should update the current editing job family, set previous job title data to null, and set the modal type", () => {
    const previousJobTitleData: JobTitleType = {
      jobTitleId: 1,
      name: "Developer"
    };
    const currentEditingJobFamily: CurrentEditingJobFamilyType = {
      jobFamilyId: 1,
      name: "Job Family",
      jobTitles: []
    };
    const setJobFamilyModalType = jest.fn();
    const setPreviousJobTitleData = jest.fn();
    const setCurrentEditingJobFamily = jest.fn();
    const setCurrentTransferMembersData = jest.fn();

    (sortJobTitlesArrayInAscendingOrder as jest.Mock).mockReturnValue([
      { jobTitleId: 1, name: "Developer" }
    ]);

    handleJobTitleDeleteBackBtnClick(
      previousJobTitleData,
      currentEditingJobFamily,
      setJobFamilyModalType,
      setPreviousJobTitleData,
      setCurrentEditingJobFamily,
      setCurrentTransferMembersData
    );

    expect(setCurrentEditingJobFamily).toHaveBeenCalledWith({
      ...currentEditingJobFamily,
      jobTitles: [{ jobTitleId: 1, name: "Developer" }]
    });
    expect(setPreviousJobTitleData).toHaveBeenCalledWith(null);
    expect(setJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.EDIT_JOB_FAMILY
    );
    expect(setCurrentTransferMembersData).toHaveBeenCalledWith(null);
  });

  it("should return if previousJobTitleData or currentEditingJobFamily is null", () => {
    const setJobFamilyModalType = jest.fn();
    const setPreviousJobTitleData = jest.fn();
    const setCurrentEditingJobFamily = jest.fn();
    const setCurrentTransferMembersData = jest.fn();

    handleJobTitleDeleteBackBtnClick(
      null,
      null,
      setJobFamilyModalType,
      setPreviousJobTitleData,
      setCurrentEditingJobFamily,
      setCurrentTransferMembersData
    );

    expect(setJobFamilyModalType).not.toHaveBeenCalled();
    expect(setPreviousJobTitleData).not.toHaveBeenCalled();
    expect(setCurrentEditingJobFamily).not.toHaveBeenCalled();
    expect(setCurrentTransferMembersData).not.toHaveBeenCalled();
  });
});

describe("handleJobTitleDropDownItemClick", () => {
  it("should update the job title for the specified employee", () => {
    const employeeId = 1;
    const item: JobTitleType = { jobTitleId: 1, name: "Developer" };
    const values: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 1, name: "Job Family" },
        jobTitle: { jobTitleId: 2, name: "Old Title" }
      }
    ];
    const setValues = jest.fn();

    handleJobTitleDropDownItemClick(employeeId, item, values, setValues);

    expect(setValues).toHaveBeenCalledWith([
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 1, name: "Job Family" },
        jobTitle: { jobTitleId: 1, name: "Developer" }
      }
    ]);
  });
});

describe("JobTitleEditConfirmationModalSubmitBtnClick", () => {
  let editJobTitleMutate: jest.MockedFunction<
    UseMutateFunction<
      AxiosResponse<any, any>,
      Error,
      EditJobFamilyMutationType,
      unknown
    >
  >;

  beforeEach(() => {
    editJobTitleMutate = jest.fn();
  });

  it("should return if any of the required parameters are null or undefined", () => {
    JobTitleEditConfirmationModalSubmitBtnClick(
      null,
      null,
      null,
      undefined,
      editJobTitleMutate
    );
    expect(editJobTitleMutate).not.toHaveBeenCalled();
  });

  it("should return if jobFamilyData is not found", () => {
    const allJobFamilies = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [{ jobTitleId: 1, name: "Developer" }],
        employees: []
      }
    ];
    const currentEditingJobFamily = {
      jobFamilyId: 2,
      name: "Human Resources",
      jobTitles: [{ jobTitleId: 1, name: "Talent Acquisition" }]
    };
    const previousJobTitleData = { jobTitleId: 1, name: "Developer" };
    const newJobTitle = { jobTitleId: 1, name: "Senior Developer" };

    JobTitleEditConfirmationModalSubmitBtnClick(
      allJobFamilies,
      currentEditingJobFamily,
      previousJobTitleData,
      newJobTitle,
      editJobTitleMutate
    );
    expect(editJobTitleMutate).not.toHaveBeenCalled();
  });

  it("should call editJobTitleMutate with correct arguments when all parameters are valid", () => {
    const allJobFamilies = [
      {
        jobFamilyId: 1,
        name: "Engineering",
        jobTitles: [{ jobTitleId: 1, name: "Developer" }],
        employees: []
      }
    ];
    const currentEditingJobFamily = {
      jobFamilyId: 1,
      name: "Engineering",
      jobTitles: [{ jobTitleId: 1, name: "Developer" }]
    };
    const previousJobTitleData = { jobTitleId: 1, name: "Developer" };
    const newJobTitle = { jobTitleId: 1, name: "Senior Developer" };

    JobTitleEditConfirmationModalSubmitBtnClick(
      allJobFamilies,
      currentEditingJobFamily,
      previousJobTitleData,
      newJobTitle,
      editJobTitleMutate
    );

    expect(editJobTitleMutate).toHaveBeenCalledWith({
      jobFamilyId: 1,
      name: "Engineering",
      titles: [
        {
          jobTitleId: 1,
          name: "Senior Developer"
        }
      ]
    });
  });
});
describe("jobTitleTransferMembersModalSubmitBtnClick", () => {
  let transferMembersWithJobTitle: jest.MockedFunction<
    UseMutateFunction<
      AxiosResponse<any, any>,
      Error,
      TransferMembersWithJobTitleMutationType,
      unknown
    >
  >;
  let setToastMessage: jest.MockedFunction<
    (value: SetStateAction<ToastProps>) => void
  >;
  let translateText: jest.MockedFunction<(key: string[]) => string>;

  beforeEach(() => {
    transferMembersWithJobTitle = jest.fn();
    setToastMessage = jest.fn();
    translateText = jest.fn((key) => key.join(" "));
  });

  it("should call transferMembersWithJobTitle with correct payload when form is valid", () => {
    const previousJobTitleData: JobTitleType = {
      jobTitleId: 1,
      name: "Developer"
    };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 1, name: "Engineering" },
        jobTitle: { jobTitleId: 2, name: "Tester" }
      }
    ];

    jobTitleTransferMembersModalSubmitBtnClick(
      previousJobTitleData,
      currentTransferMembersData,
      transferMembersWithJobTitle,
      setToastMessage,
      translateText
    );

    expect(transferMembersWithJobTitle).toHaveBeenCalledWith({
      jobTitleId: 1,
      payload: [{ employeeId: 1, jobTitleId: 2 }]
    });
    expect(setToastMessage).not.toHaveBeenCalled();
  });

  it("should show error toast when form is invalid", () => {
    const previousJobTitleData: JobTitleType = {
      jobTitleId: 1,
      name: "Developer"
    };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 1, name: "Engineering" },
        jobTitle: null
      }
    ];

    jobTitleTransferMembersModalSubmitBtnClick(
      previousJobTitleData,
      currentTransferMembersData,
      transferMembersWithJobTitle,
      setToastMessage,
      translateText
    );

    expect(transferMembersWithJobTitle).not.toHaveBeenCalled();
    expect(setToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "error",
      title: "jobTitleTransferModalRequiredToastErrorTitle",
      description: "jobTitleTransferModalRequiredToastErrorDescription",
      isIcon: false
    });
  });

  it("should return if previousJobTitleData or currentTransferMembersData is null", () => {
    jobTitleTransferMembersModalSubmitBtnClick(
      null,
      null,
      transferMembersWithJobTitle,
      setToastMessage,
      translateText
    );

    expect(transferMembersWithJobTitle).not.toHaveBeenCalled();
    expect(setToastMessage).not.toHaveBeenCalled();
  });
});
