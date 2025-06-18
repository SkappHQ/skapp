import { FormikErrors } from "formik";
import { ChangeEvent, KeyboardEvent } from "react";

import {
  allowsOnlyLettersAndSpaces,
  hasSpecialCharactersAndNumbers,
  matchesCommaFollowedByNonWhitespace,
  matchesTwoOrMoreConsecutiveWhitespaceCharacters
} from "~community/common/regex/regexPatterns";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AddJobFamilyFormType,
  AllJobFamilyType,
  JobTitleType
} from "~community/people/types/JobFamilyTypes";

import { getEmployeesWithJobTitle } from "./jobTitleUtils";

export const handleJobTitleInputChange = (
  event: ChangeEvent<HTMLInputElement>,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void = () => {}
) => {
  const inputValue = event.target.value;

  setFieldValue(
    "jobTitleInput",
    inputValue
      .replace(allowsOnlyLettersAndSpaces(), "")
      .replace(matchesTwoOrMoreConsecutiveWhitespaceCharacters(), " ")
      .trimStart()
  );
};

export const getJobTitleNameError = (
  errors: FormikErrors<AddJobFamilyFormType>,
  index: number = 0
) => {
  const error =
    errors.jobTitles && errors.jobTitles[index]
      ? typeof errors.jobTitles[index] === "string"
        ? errors.jobTitles[index]
        : errors.jobTitles[index]?.name
      : "";

  return error;
};

export const handleJobTitleNameChange = (
  event: ChangeEvent<HTMLInputElement>,
  index: number,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void = () => {},
  setFieldError: (field: string, value: string | undefined) => void
) => {
  setFieldError(`jobTitles.${index}.name`, "");

  setFieldValue(
    `jobTitles.${index}.name`,
    event.target.value
      .replace(hasSpecialCharactersAndNumbers(), " ")
      .replace(matchesTwoOrMoreConsecutiveWhitespaceCharacters(), " ")
      .trimStart()
      .replace(matchesCommaFollowedByNonWhitespace(), ", $1")
  );
};

export const handleJobTitleAddBtnClick = async (
  values: AddJobFamilyFormType,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void,
  setFieldError: (field: string, value: string | undefined) => void
) => {
  setFieldError("jobTitleInput", "");

  if (values.jobTitleInput.trim().length > 0) {
    const newValues = [
      ...(values?.jobTitles || []),
      {
        jobTitleId: null,
        name: values.jobTitleInput.trim()
      }
    ];

    await setFieldValue("jobTitleInput", "");
    await setFieldValue("jobTitles", newValues);
  }
};

export const handleJobTitleFieldKeyDown = async (
  event: KeyboardEvent<HTMLInputElement>,
  values: AddJobFamilyFormType,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void,
  setFieldError: (field: string, value: string | undefined) => void
) => {
  if (event.key === "Enter") {
    event.preventDefault();

    handleJobTitleAddBtnClick(values, setFieldValue, setFieldError);
  }
};

export const handleEditIconBtnClick = (
  jobTitle: JobTitleType,
  setEditingInputField: (value: number | null) => void,
  hoveredInputField: number | null,
  setPreviousJobTitleData: (value: JobTitleType | null) => void
) => {
  setEditingInputField(hoveredInputField);
  setPreviousJobTitleData(jobTitle);
};

export const handleBinIconBtnClick = async (
  jobTitle: JobTitleType,
  setPreviousJobTitleData: (value: JobTitleType | null) => void = () => {},
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void = () => {},
  values: AddJobFamilyFormType,
  allJobFamilies: AllJobFamilyType[] | null = null,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void = () => {}
) => {
  const existingJobTitles = values?.jobTitles?.filter(
    (item) => item.jobTitleId !== null
  );

  const noOfExistingJobTitles = existingJobTitles?.length ?? 0;

  if (noOfExistingJobTitles === 1) {
    setJobFamilyModalType(JobFamilyActionModalEnums.ADD_NEW_JOB_TITLE);
    return;
  }

  const updatedJobTitles = values.jobTitles.filter(
    (item) =>
      item.name.trim().toLowerCase() !== jobTitle.name.trim().toLowerCase()
  );

  await setFieldValue("jobTitles", updatedJobTitles);

  if (jobTitle.jobTitleId === null) {
    return;
  }

  const employeesWithJobTitle = getEmployeesWithJobTitle(
    allJobFamilies,
    values.jobFamilyId,
    jobTitle?.name
  )?.length;

  setPreviousJobTitleData(jobTitle);
  setJobFamilyModalType(
    employeesWithJobTitle === 0
      ? JobFamilyActionModalEnums.JOB_TITLE_DELETE_CONFIRMATION
      : JobFamilyActionModalEnums.JOB_TITLE_DELETION_WARNING
  );
};

export const handleTickIconBtnClick = async (
  index: number,
  values: AddJobFamilyFormType,
  previousJobTitleData: JobTitleType | null,
  allJobFamilies: AllJobFamilyType[] | null,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void,
  setEditingInputField: (value: any) => void
) => {
  if (!previousJobTitleData) {
    return;
  }

  const currentJobTitleName = values.jobTitles[index].name.trim();
  const previousJobTitleName = previousJobTitleData?.name.trim();

  if (
    currentJobTitleName.toLowerCase() !== previousJobTitleName.toLowerCase()
  ) {
    const newJobTitleValue: JobTitleType = {
      ...values.jobTitles[index],
      name: currentJobTitleName
    };

    await setFieldValue(`jobTitles.${index}`, newJobTitleValue);

    const hasEmployeesWithJobTitle = getEmployeesWithJobTitle(
      allJobFamilies,
      values.jobFamilyId,
      previousJobTitleData?.name ?? ""
    )?.length;

    if (hasEmployeesWithJobTitle && hasEmployeesWithJobTitle > 0) {
      setJobFamilyModalType(
        JobFamilyActionModalEnums.JOB_TITLE_EDIT_CONFIRMATION
      );
    }

    setEditingInputField(null);
  }
};

export const handleCloseIconBtnClick = (
  index: number,
  previousJobTitleData: JobTitleType | null,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void,
  setPreviousJobTitleData: (value: JobTitleType | null) => void,
  setEditingInputField: (value: number | null) => void
) => {
  setFieldValue(`jobTitles.${index}.name`, previousJobTitleData?.name);
  setPreviousJobTitleData(null);
  setEditingInputField(null);
};
