import { useMemo } from "react";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useEditJobFamily } from "~community/people/api/JobFamilyApi";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import {
  JobTitleEditConfirmationModalSubmitBtnClick,
  handleJobTitleEditBackBtnClick
} from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

const JobTitleEditConfirmationModal = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setToastMessage } = useToast();

  const {
    allJobFamilies,
    currentEditingJobFamily,
    previousJobTitleData,
    setCurrentEditingJobFamily,
    setJobFamilyModalType,
    setPreviousJobTitleData
  } = usePeopleStore((state) => state);

  const onSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_TITLE_SUCCESS,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.EDIT_JOB_TITLE_ERROR,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const { mutate: editJobTitleMutate } = useEditJobFamily(onSuccess, onError);

  const newJobTitle = useMemo(() => {
    return currentEditingJobFamily?.jobTitles.find(
      (jobTitle) => jobTitle.jobTitleId === previousJobTitleData?.jobTitleId
    );
  }, [currentEditingJobFamily, previousJobTitleData?.jobTitleId]);

  return (
    <UserPromptModal
      description={
        <span>
          {translateText(["jobTitleEditConfirmationModalDescriptionPartOne"])}
          <b>{previousJobTitleData?.name}</b>
          {translateText(["jobTitleEditConfirmationModalDescriptionPartTwo"])}
          <b>{newJobTitle?.name}</b>
          {translateText(["jobTitleEditConfirmationModalDescriptionPartThree"])}
        </span>
      }
      primaryBtn={{
        label: translateText(["jobTitleEditConfirmationModalBtn"]),
        onClick: () =>
          JobTitleEditConfirmationModalSubmitBtnClick(
            allJobFamilies,
            currentEditingJobFamily,
            previousJobTitleData,
            newJobTitle,
            editJobTitleMutate
          ),
        endIcon: IconName.RIGHT_ARROW_ICON
      }}
      secondaryBtn={{
        label: translateText(["cancelBtnText"]),
        onClick: () =>
          handleJobTitleEditBackBtnClick(
            previousJobTitleData,
            currentEditingJobFamily,
            setCurrentEditingJobFamily,
            setJobFamilyModalType,
            setPreviousJobTitleData
          ),
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default JobTitleEditConfirmationModal;
