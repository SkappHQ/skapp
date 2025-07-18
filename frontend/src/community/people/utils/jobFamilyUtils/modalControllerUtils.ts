import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import {
  AllJobFamilyType,
  CurrentEditingJobFamilyType,
  TransferMemberFormType
} from "~community/people/types/JobFamilyTypes";

import { getJobFamilyDataFromAllJobFamilies } from "./jobTitleUtils";

export const getModalTitle = (
  jobFamilyModalType: JobFamilyActionModalEnums,
  peopleTranslateText: TranslatorFunctionType
): string => {
  switch (jobFamilyModalType) {
    case JobFamilyActionModalEnums.ADD_JOB_FAMILY:
      return peopleTranslateText(["addJobFamilyModalTitle"]);
    case JobFamilyActionModalEnums.EDIT_JOB_FAMILY:
      return peopleTranslateText(["editJobFamilyModalTitle"]);
    case JobFamilyActionModalEnums.JOB_FAMILY_DELETE_CONFIRMATION:
      return peopleTranslateText(["deleteModalTitle"]);
    case JobFamilyActionModalEnums.JOB_FAMILY_DELETION_WARNING:
      return peopleTranslateText(["alert"]);
    case JobFamilyActionModalEnums.JOB_TITLE_DELETE_CONFIRMATION:
      return peopleTranslateText(["deleteModalTitle"]);
    case JobFamilyActionModalEnums.JOB_TITLE_DELETION_WARNING:
      return peopleTranslateText(["alert"]);
    case JobFamilyActionModalEnums.ADD_NEW_JOB_FAMILY:
      return peopleTranslateText(["alert"]);
    case JobFamilyActionModalEnums.ADD_NEW_JOB_TITLE:
      return peopleTranslateText(["alert"]);
    case JobFamilyActionModalEnums.JOB_TITLE_EDIT_CONFIRMATION:
      return peopleTranslateText(["jobTitleEditConfirmationModalTitle"]);
    case JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS:
      return peopleTranslateText(["transferMembers"]);
    case JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS:
      return peopleTranslateText(["transferMembers"]);
    case JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY:
    case JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY_TRANSFER_MEMBERS:
    case JobFamilyActionModalEnums.UNSAVED_CHANGED_JOB_TITLE_TRANSFER_MEMBERS:
      return peopleTranslateText(["unsavedChangesModalTitle"]);
    default:
      return "";
  }
};

export const isClosableModalType = (
  jobFamilyModalType: JobFamilyActionModalEnums
): boolean => {
  return (
    jobFamilyModalType === JobFamilyActionModalEnums.ADD_JOB_FAMILY ||
    jobFamilyModalType === JobFamilyActionModalEnums.EDIT_JOB_FAMILY
  );
};

export const getCustomStyles = (
  jobFamilyModalType: JobFamilyActionModalEnums
) => {
  const applyCustomStyles =
    jobFamilyModalType ===
      JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS ||
    jobFamilyModalType === JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS;

  if (applyCustomStyles) {
    return {
      modalWrapperStyles: {
        width: { xs: "100%", sm: "37.5rem" }
      },
      modalContentStyles: {
        maxWidth: { xs: "calc(100dvw - 1.25rem)", sm: "37.5rem" }
      }
    };
  } else {
    return {
      modalWrapperStyles: {},
      modalContentStyles: {}
    };
  }
};

export const handleJobFamilyCloseModal = ({
  hasDataChanged,
  jobFamilyModalType,
  setJobFamilyModalType,
  stopAllOngoingQuickSetup
}: {
  hasDataChanged: boolean;
  jobFamilyModalType: JobFamilyActionModalEnums;
  setJobFamilyModalType: (modalType: JobFamilyActionModalEnums) => void;
  stopAllOngoingQuickSetup: () => void;
}): void => {
  let nextModalType = JobFamilyActionModalEnums.NONE;

  if (hasDataChanged) {
    switch (jobFamilyModalType) {
      case JobFamilyActionModalEnums.ADD_JOB_FAMILY:
      case JobFamilyActionModalEnums.EDIT_JOB_FAMILY:
        nextModalType = JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY;
        break;
      case JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS:
        nextModalType =
          JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY_TRANSFER_MEMBERS;
        break;
      case JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS:
        nextModalType =
          JobFamilyActionModalEnums.UNSAVED_CHANGED_JOB_TITLE_TRANSFER_MEMBERS;
        break;
      default:
        break;
    }
  } else {
    stopAllOngoingQuickSetup();
  }

  setJobFamilyModalType(nextModalType);
};

export const hasJobFamilyMemberDataChanged = (
  currentTransferMembersData: TransferMemberFormType[] | null
) => {
  return (
    currentTransferMembersData !== null &&
    currentTransferMembersData?.some(
      (member: TransferMemberFormType) =>
        member.jobTitle !== null || member.jobFamily !== null
    )
  );
};

export const hasJobTitleMemberDataChanged = (
  currentTransferMembersData: TransferMemberFormType[] | null
) => {
  return (
    currentTransferMembersData !== null &&
    currentTransferMembersData?.some(
      (member: TransferMemberFormType) => member.jobTitle !== null
    )
  );
};

export const checkDataChanges = (
  jobFamilyModalType: JobFamilyActionModalEnums,
  currentEditingJobFamily: CurrentEditingJobFamilyType | null,
  allJobFamilies: AllJobFamilyType[] | null,
  currentTransferMembersData: TransferMemberFormType[] | null
): boolean => {
  const previousJobFamilyData = getJobFamilyDataFromAllJobFamilies(
    allJobFamilies,
    currentEditingJobFamily?.jobFamilyId
  );

  const isJobFamilyNamePresent =
    (currentEditingJobFamily?.name?.trim()?.length ?? 0) !== 0;

  const isJobTitlesPresent = currentEditingJobFamily?.jobTitles?.length !== 0;

  const hasJobFamilyNameChanged =
    currentEditingJobFamily?.name !== previousJobFamilyData?.name;

  const hasJobTitlesChanged =
    JSON.stringify(currentEditingJobFamily?.jobTitles) !==
    JSON.stringify(previousJobFamilyData?.jobTitles);

  switch (jobFamilyModalType) {
    case JobFamilyActionModalEnums.ADD_JOB_FAMILY:
      return isJobFamilyNamePresent || isJobTitlesPresent;
    case JobFamilyActionModalEnums.EDIT_JOB_FAMILY:
      return hasJobFamilyNameChanged || hasJobTitlesChanged;
    case JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS:
      return hasJobFamilyMemberDataChanged(currentTransferMembersData);
    case JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS:
      return hasJobTitleMemberDataChanged(currentTransferMembersData);
    default:
      return false;
  }
};
