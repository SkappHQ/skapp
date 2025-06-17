import { UseMutateFunction } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { ChangeEvent, SetStateAction } from "react";

import { SelectOption } from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import {
  hasSpecialCharactersAndNumbers,
  matchesTwoOrMoreConsecutiveWhitespaceCharacters
} from "~community/common/regex/regexPatterns";
import { ToastProps } from "~community/common/types/ToastTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  DeletingJobFamily,
  TransferMemberFormType,
  TransferMembersWithJobFamilyMutationType,
  TransferMembersWithJobFamilyPayloadType
} from "~community/people/types/JobFamilyTypes";

export const handleJobFamilyNameInputChange = async (
  event: ChangeEvent<HTMLInputElement>,
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void = () => {},
  setFieldError: (field: string, value: string | undefined) => void
) => {
  setFieldError("name", "");

  const cleanedValue = event.target.value
    .replace(hasSpecialCharactersAndNumbers(), "")
    .replace(matchesTwoOrMoreConsecutiveWhitespaceCharacters(), " ");

  await setFieldValue("name", cleanedValue);
};

export const handleJobFamilyDeleteBackBtnClick = (
  setCurrentDeletingJobFamily: (value: DeletingJobFamily | null) => void,
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void
) => {
  setCurrentDeletingJobFamily(null);
  setJobFamilyModalType(JobFamilyActionModalEnums.NONE);
};

export const handleJobFamilyDropDownItemClick = (
  employeeId: number | undefined,
  item: SelectOption,
  values: TransferMemberFormType[],
  setValues: (value: TransferMemberFormType[]) => void
) => {
  const updatedValues = values.map((value) =>
    value.employeeId === employeeId
      ? {
          ...value,
          jobFamily: {
            jobFamilyId: Number(item.value),
            name: item.label
          },
          jobTitle: null
        }
      : value
  );

  setValues(updatedValues);
};

export const isJobFamilyTransferMembersFormValid = (
  currentTransferMembersData: TransferMemberFormType[] | null
) => {
  if (!currentTransferMembersData) {
    return false;
  }

  return currentTransferMembersData.every(
    (member: TransferMemberFormType) =>
      member.jobTitle !== null || member.jobFamily !== null
  );
};

export const jobFamilyTransferMembersSubmitBtnClick = (
  currentDeletingJobFamily: DeletingJobFamily | null,
  currentTransferMembersData: TransferMemberFormType[] | null,
  transferMembersWithJobFamily: UseMutateFunction<
    AxiosResponse<any, any>,
    Error,
    TransferMembersWithJobFamilyMutationType,
    unknown
  >,
  setToastMessage: (value: SetStateAction<ToastProps>) => void,
  translateText: (key: string[]) => string
) => {
  if (isJobFamilyTransferMembersFormValid(currentTransferMembersData)) {
    const payload = currentTransferMembersData
      ?.filter((value) => value.jobTitle !== null)
      .map((value: TransferMemberFormType) => ({
        employeeId: value.employeeId,
        jobFamilyId: value.jobFamily?.jobFamilyId,
        jobTitleId: value.jobTitle?.jobTitleId
      }));

    if (payload && payload.length > 0) {
      transferMembersWithJobFamily({
        jobFamilyId: currentDeletingJobFamily?.jobFamilyId ?? 0,
        payload: payload as TransferMembersWithJobFamilyPayloadType[]
      });
    }
  } else {
    setToastMessage({
      open: true,
      toastType: "error",
      title: translateText(["jobFamilyTransferModalRequiredToastErrorTitle"]),
      description: translateText([
        "jobFamilyTransferModalRequiredToastErrorDescription"
      ]),
      isIcon: false
    });
  }
};

export const jobFamilyTransferMembersCancelBtnClick = (
  setJobFamilyModalType: (value: JobFamilyActionModalEnums) => void,
  setCurrentTransferMembersData: (
    value: TransferMemberFormType[] | null
  ) => void
) => {
  setJobFamilyModalType(JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING);
  setCurrentTransferMembersData(null);
};
