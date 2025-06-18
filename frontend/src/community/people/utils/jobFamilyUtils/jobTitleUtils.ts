import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { SetStateAction } from "react";

import { ToastProps } from "~community/common/types/ToastTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  EditJobFamilyMutationType,
  JobFamilyEmployeeDataType,
  JobTitleType,
  TransferMemberFormType,
  TransferMembersWithJobTitleMutationType,
  TransferMembersWithJobTitlePayloadType
} from "~community/people/types/JobFamilyTypes";
import { sortJobTitlesArrayInAscendingOrder } from "~community/people/utils/jobFamilyUtils/commonUtils";

export const getJobFamilyDataFromAllJobFamilies = (
  allJobFamilies: AllJobFamilyType[] | null,
  jobFamilyId: number | undefined
) => {
  if (!allJobFamilies || !jobFamilyId) {
    return;
  }

  const previousJobFamilyData: AllJobFamilyType | undefined =
    allJobFamilies?.find(
      (jobFamily: AllJobFamilyType) => jobFamily.jobFamilyId === jobFamilyId
    );

  return previousJobFamilyData;
};

export const getEmployeesWithJobTitle = (
  allJobFamilies: AllJobFamilyType[] | null,
  jobFamilyId: number,
  jobTitleName: string
) => {
  if (allJobFamilies === null) {
    return [];
  }

  const jobFamilyData = getJobFamilyDataFromAllJobFamilies(
    allJobFamilies,
    jobFamilyId
  );

  if (jobFamilyData === undefined) {
    return [];
  }

  const employees = jobFamilyData?.employees.filter(
    (employee: JobFamilyEmployeeDataType) =>
      employee.jobTitle?.name.toLowerCase() === jobTitleName.toLowerCase()
  );

  return employees;
};

export const handleJobTitleEditBackBtnClick = (
  previousJobTitleData: JobTitleType | null,
  currentEditingJobFamily: CurrentEditingJobFamilyType | null,
  setCurrentEditingJobFamily: (
    value: CurrentEditingJobFamilyType | null
  ) => void,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void,
  setPreviousJobTitleData: (value: JobTitleType | null) => void
) => {
  if (!previousJobTitleData || !currentEditingJobFamily) {
    return;
  }

  const updatedJobTitles = currentEditingJobFamily.jobTitles.map(
    (jobTitle: JobTitleType) =>
      jobTitle.jobTitleId === previousJobTitleData.jobTitleId
        ? { ...previousJobTitleData }
        : jobTitle
  );

  const sortedJobTitles = sortJobTitlesArrayInAscendingOrder(updatedJobTitles);

  const updatedEditingJobFamily = {
    ...currentEditingJobFamily,
    jobTitles: sortedJobTitles
  };

  setCurrentEditingJobFamily(updatedEditingJobFamily);
  setPreviousJobTitleData(null);
  setJobFamilyModalType(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
};

export const handleJobTitleDeleteBackBtnClick = (
  previousJobTitleData: JobTitleType | null,
  currentEditingJobFamily: CurrentEditingJobFamilyType | null,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void,
  setPreviousJobTitleData: (value: JobTitleType | null) => void,
  setCurrentEditingJobFamily: (
    value: CurrentEditingJobFamilyType | null
  ) => void,
  setCurrentTransferMembersData: (
    value: TransferMemberFormType[] | null
  ) => void
) => {
  if (!previousJobTitleData || !currentEditingJobFamily) {
    return;
  }

  const updatedJobTitles = [
    ...currentEditingJobFamily.jobTitles,
    previousJobTitleData
  ];

  const sortedJobTitles = sortJobTitlesArrayInAscendingOrder(updatedJobTitles);

  const updatedEditingJobFamily = {
    ...currentEditingJobFamily,
    jobTitles: sortedJobTitles
  };

  setCurrentEditingJobFamily(updatedEditingJobFamily);
  setPreviousJobTitleData(null);
  setCurrentTransferMembersData(null);
  setJobFamilyModalType(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
};

export const handleJobTitleDropDownItemClick = (
  employeeId: number | undefined,
  item: {
    value: number;
    label: string;
  },
  values: TransferMemberFormType[],
  setValues: (value: TransferMemberFormType[]) => void
) => {
  const updatedValues = values.map((value) =>
    value.employeeId === employeeId
      ? {
          ...value,
          jobTitle: {
            jobTitleId: item.value === 0 ? null : item.value,
            name: item.label
          }
        }
      : value
  );

  setValues(updatedValues);
};

export const JobTitleEditConfirmationModalSubmitBtnClick = (
  allJobFamilies: AllJobFamilyType[] | null,
  currentEditingJobFamily: CurrentEditingJobFamilyType | null,
  previousJobTitleData: JobTitleType | null,
  newJobTitle: JobTitleType | undefined,
  editJobTitleMutate: UseMutateFunction<
    AxiosResponse<any, any>,
    Error,
    EditJobFamilyMutationType,
    unknown
  >
) => {
  if (
    !allJobFamilies ||
    !currentEditingJobFamily ||
    !previousJobTitleData ||
    !newJobTitle
  ) {
    return;
  }

  const jobFamilyData = allJobFamilies.find(
    (jobFamily) => jobFamily.jobFamilyId === currentEditingJobFamily.jobFamilyId
  );

  if (!jobFamilyData) {
    return;
  }

  editJobTitleMutate({
    jobFamilyId: jobFamilyData.jobFamilyId,
    name: jobFamilyData.name,
    titles: [
      {
        jobTitleId: previousJobTitleData.jobTitleId ?? 0,
        name: newJobTitle.name
      }
    ]
  });
};

export const isJobTitleTransferMembersFormValid = (
  currentTransferMembersData: TransferMemberFormType[] | null
) => {
  if (!currentTransferMembersData) {
    return false;
  }

  return currentTransferMembersData.every(
    (member: TransferMemberFormType) => member.jobTitle !== null
  );
};

export const jobTitleTransferMembersModalSubmitBtnClick = (
  previousJobTitleData: JobTitleType | null,
  currentTransferMembersData: TransferMemberFormType[] | null,
  transferMembersWithJobTitle: UseMutateFunction<
    AxiosResponse<any, any>,
    Error,
    TransferMembersWithJobTitleMutationType,
    unknown
  >,
  setToastMessage: (value: SetStateAction<ToastProps>) => void,
  translateText: (key: string[]) => string
) => {
  if (!previousJobTitleData || !currentTransferMembersData) {
    return;
  }

  if (isJobTitleTransferMembersFormValid(currentTransferMembersData)) {
    const payload = currentTransferMembersData?.map(
      (value: TransferMemberFormType) => ({
        employeeId: value.employeeId,
        jobTitleId: value.jobTitle?.jobTitleId
      })
    );

    transferMembersWithJobTitle({
      jobTitleId: currentTransferMembersData[0]?.jobFamily?.jobFamilyId ?? 0,
      payload: payload as TransferMembersWithJobTitlePayloadType[]
    });
  } else {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["jobTitleTransferModalRequiredToastErrorTitle"]),
      description: translateText([
        "jobTitleTransferModalRequiredToastErrorDescription"
      ]),
      isIcon: false
    });
  }
};
