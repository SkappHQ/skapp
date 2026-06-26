import { SetStateAction } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { ToastProps } from "~community/common/types/ToastTypes";
import {
  JobFamilyActionModalEnums,
  JobFamilyToastEnums
} from "~community/people/enums/JobFamilyEnums";

interface HandleJobFamilyApiResponseProps {
  type: JobFamilyToastEnums;
  setToastMessage: (value: SetStateAction<ToastProps>) => void;
  translateText: (key: string[]) => string;
  setJobFamilyModalType?: (value: JobFamilyActionModalEnums) => void;
  from?: string;
}

export const handleJobFamilyApiResponse = ({
  type,
  setToastMessage,
  setJobFamilyModalType,
  translateText,
  from
}: HandleJobFamilyApiResponseProps) => {
  switch (type) {
    case JobFamilyToastEnums.AT_LEAST_ONE_JOB_TITLE:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["atLeastOneJobTitleRequired.title"]),
        description: translateText(["atLeastOneJobTitleRequired.description"])
      });
      break;
    case JobFamilyToastEnums.ADD_JOB_FAMILY_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["addJobFamilySuccessToastTitle"]),
        description: translateText(["addJobFamilySuccessToastDescription"])
      });

      if (!from && from !== "add-new-resource")
        setJobFamilyModalType?.(JobFamilyActionModalEnums.NONE);
      break;
    case JobFamilyToastEnums.ADD_JOB_FAMILY_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText(["addJobFamilyErrorToastDescription"])
      });
      break;
    case JobFamilyToastEnums.EDIT_JOB_FAMILY_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["editJobFamilySuccessToastTitle"]),
        description: translateText(["editJobFamilySuccessToastDescription"])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.NONE);
      break;
    case JobFamilyToastEnums.EDIT_JOB_FAMILY_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText(["editJobFamilyErrorToastDescription"])
      });
      break;
    case JobFamilyToastEnums.DELETE_JOB_FAMILY_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["deleteJobFamilySuccessToastTitle"]),
        description: translateText(["deleteJobFamilySuccessToastDescription"])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.NONE);
      break;
    case JobFamilyToastEnums.DELETE_JOB_FAMILY_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText(["deleteJobFamilyErrorToastDescription"])
      });
      break;
    case JobFamilyToastEnums.EDIT_JOB_TITLE_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["editJobTitleSuccessToastTitle"]),
        description: translateText(["editJobTitleSuccessToastDescription"])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
      break;
    case JobFamilyToastEnums.EDIT_JOB_TITLE_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText(["editJobTitleErrorToastDescription"])
      });
      break;
    case JobFamilyToastEnums.DELETE_JOB_TITLE_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["deleteJobTitleSuccessToastTitle"]),
        description: translateText(["deleteJobTitleSuccessToastDescription"])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
      break;
    case JobFamilyToastEnums.DELETE_JOB_TITLE_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText(["deleteJobTitleErrorToastDescription"])
      });
      break;
    case JobFamilyToastEnums.JOB_FAMILY_TRANSFER_MEMBERS_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["jobFamilyTransferMembersSuccessToastTitle"]),
        description: translateText([
          "jobFamilyTransferMembersSuccessToastDescription"
        ])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.NONE);
      break;
    case JobFamilyToastEnums.JOB_FAMILY_TRANSFER_MEMBERS_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText([
          "jobFamilyTransferMembersErrorToastDescription"
        ])
      });
      break;
    case JobFamilyToastEnums.JOB_TITLE_TRANSFER_MEMBERS_SUCCESS:
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["jobTitleTransferMembersSuccessToastTitle"]),
        description: translateText([
          "jobTitleTransferMembersSuccessToastDescription"
        ])
      });
      setJobFamilyModalType?.(JobFamilyActionModalEnums.EDIT_JOB_FAMILY);
      break;
    case JobFamilyToastEnums.JOB_TITLE_TRANSFER_MEMBERS_ERROR:
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["jobFamilyErrorToastTitle"]),
        description: translateText([
          "jobTitleTransferMembersErrorToastDescription"
        ])
      });
      break;
    default:
      break;
  }
};
