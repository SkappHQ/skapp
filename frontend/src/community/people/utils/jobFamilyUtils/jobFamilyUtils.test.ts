import { ChangeEvent } from "react";

import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  JobFamilyDropDownType,
  TransferMemberFormType
} from "~community/people/types/JobFamilyTypes";

import {
  handleJobFamilyDeleteBackBtnClick,
  handleJobFamilyDropDownItemClick,
  handleJobFamilyNameInputChange,
  jobFamilyTransferMembersCancelBtnClick,
  jobFamilyTransferMembersSubmitBtnClick
} from "./jobFamilyUtils";

jest.mock("~community/common/regex/regexPatterns", () => ({
  hasSpecialCharactersAndNumbers: jest.fn(() => /[^a-zA-Z\s]/g),
  matchesTwoOrMoreConsecutiveWhitespaceCharacters: jest.fn(() => /\s{2,}/g)
}));

jest.mock("./modalControllerUtils", () => ({
  hasJobFamilyMemberDataChanged: jest.fn(() => true)
}));

describe("handleJobFamilyNameInputChange", () => {
  it("should call setFieldValue with the cleaned input value", async () => {
    const mockSetFieldValue = jest.fn();
    const mockSetFieldError = jest.fn();
    const mockEvent = {
      target: {
        value: "Job@Family  Name123"
      }
    } as ChangeEvent<HTMLInputElement>;

    await handleJobFamilyNameInputChange(
      mockEvent,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockSetFieldValue).toHaveBeenCalledWith("name", "JobFamily Name");
  });

  it("should call setFieldError with an empty string", async () => {
    const mockSetFieldValue = jest.fn();
    const mockSetFieldError = jest.fn();
    const mockEvent = {
      target: {
        value: "Job@Family  Name123"
      }
    } as ChangeEvent<HTMLInputElement>;

    await handleJobFamilyNameInputChange(
      mockEvent,
      mockSetFieldValue,
      mockSetFieldError
    );

    expect(mockSetFieldError).toHaveBeenCalledWith("name", "");
  });
});

describe("handleJobFamilyDeleteBackBtnClick", () => {
  const mockSetCurrentDeletingJobFamily = jest.fn();
  const mockSetJobFamilyModalType = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set current deleting job family to null", () => {
    handleJobFamilyDeleteBackBtnClick(
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledWith(null);
  });

  it("should set modal type to NONE", () => {
    handleJobFamilyDeleteBackBtnClick(
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.NONE
    );
  });

  it("should call setCurrentDeletingJobFamily and setJobFamilyModalType exactly once each", () => {
    handleJobFamilyDeleteBackBtnClick(
      mockSetCurrentDeletingJobFamily,
      mockSetJobFamilyModalType
    );

    expect(mockSetCurrentDeletingJobFamily).toHaveBeenCalledTimes(1);
    expect(mockSetJobFamilyModalType).toHaveBeenCalledTimes(1);
  });
});

describe("handleJobFamilyDropDownItemClick", () => {
  it("should update the job family and reset job title for the correct employee", () => {
    const employeeId = 1;
    const newJobFamily: JobFamilyDropDownType = {
      jobFamilyId: 3,
      name: "Engineering"
    };
    const values: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: null,
        jobTitle: { jobTitleId: 2, name: "Developer" }
      },
      { employeeId: 2, jobFamily: null, jobTitle: null }
    ];
    const setValues = jest.fn();

    handleJobFamilyDropDownItemClick(
      employeeId,
      newJobFamily,
      values,
      setValues
    );

    expect(setValues).toHaveBeenCalledWith([
      { employeeId: 1, jobFamily: newJobFamily, jobTitle: null },
      { employeeId: 2, jobFamily: null, jobTitle: null }
    ]);
  });
});

describe("jobFamilyTransferMembersSubmitBtnClick", () => {
  const mockTransferMembersWithJobFamily = jest.fn();
  const mockSetToastMessage = jest.fn();
  const mockTranslateText = jest.fn((key: string[]) => key.join(" "));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call transferMembersWithJobFamily with the correct payload when form is valid", () => {
    const currentDeletingJobFamily = { jobFamilyId: 1, employees: [] };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 2, name: "Engineering" },
        jobTitle: { jobTitleId: 3, name: "Developer" }
      }
    ];

    jobFamilyTransferMembersSubmitBtnClick(
      currentDeletingJobFamily,
      currentTransferMembersData,
      mockTransferMembersWithJobFamily,
      mockSetToastMessage,
      mockTranslateText
    );

    expect(mockTransferMembersWithJobFamily).toHaveBeenCalledWith({
      jobFamilyId: 1,
      payload: [
        {
          employeeId: 1,
          jobFamilyId: 2,
          jobTitleId: 3
        }
      ]
    });
  });

  it("should not call transferMembersWithJobFamily when form is invalid", () => {
    const currentDeletingJobFamily = { jobFamilyId: 1, employees: [] };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: null,
        jobTitle: null
      }
    ];

    jobFamilyTransferMembersSubmitBtnClick(
      currentDeletingJobFamily,
      currentTransferMembersData,
      mockTransferMembersWithJobFamily,
      mockSetToastMessage,
      mockTranslateText
    );

    expect(mockTransferMembersWithJobFamily).not.toHaveBeenCalled();
  });

  it("should set toast message when form is invalid", () => {
    const currentDeletingJobFamily = { jobFamilyId: 1, employees: [] };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: null,
        jobTitle: null
      }
    ];

    jobFamilyTransferMembersSubmitBtnClick(
      currentDeletingJobFamily,
      currentTransferMembersData,
      mockTransferMembersWithJobFamily,
      mockSetToastMessage,
      mockTranslateText
    );

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: "error",
      title: "jobFamilyTransferModalRequiredToastErrorTitle",
      description: "jobFamilyTransferModalRequiredToastErrorDescription",
      isIcon: false
    });
  });

  it("should not call setToastMessage when form is valid", () => {
    const currentDeletingJobFamily = { jobFamilyId: 1, employees: [] };
    const currentTransferMembersData: TransferMemberFormType[] = [
      {
        employeeId: 1,
        jobFamily: { jobFamilyId: 2, name: "Engineering" },
        jobTitle: { jobTitleId: 3, name: "Developer" }
      }
    ];

    jobFamilyTransferMembersSubmitBtnClick(
      currentDeletingJobFamily,
      currentTransferMembersData,
      mockTransferMembersWithJobFamily,
      mockSetToastMessage,
      mockTranslateText
    );

    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });
});

describe("jobFamilyTransferMembersCancelBtnClick", () => {
  const mockSetJobFamilyModalType = jest.fn();
  const mockSetCurrentTransferMembersData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set modal type to JOB_FAMILY_DELETION_WARNING", () => {
    jobFamilyTransferMembersCancelBtnClick(
      mockSetJobFamilyModalType,
      mockSetCurrentTransferMembersData
    );

    expect(mockSetJobFamilyModalType).toHaveBeenCalledWith(
      JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING
    );
  });

  it("should set current transfer members data to null", () => {
    jobFamilyTransferMembersCancelBtnClick(
      mockSetJobFamilyModalType,
      mockSetCurrentTransferMembersData
    );

    expect(mockSetCurrentTransferMembersData).toHaveBeenCalledWith(null);
  });

  it("should call setJobFamilyModalType and setCurrentTransferMembersData exactly once each", () => {
    jobFamilyTransferMembersCancelBtnClick(
      mockSetJobFamilyModalType,
      mockSetCurrentTransferMembersData
    );

    expect(mockSetJobFamilyModalType).toHaveBeenCalledTimes(1);
    expect(mockSetCurrentTransferMembersData).toHaveBeenCalledTimes(1);
  });
});
