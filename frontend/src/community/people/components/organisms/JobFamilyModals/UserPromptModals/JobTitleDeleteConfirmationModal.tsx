import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteJobTitle } from "~community/people/api/JobFamilyApi";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import { handleJobTitleDeleteBackBtnClick } from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

const JobTitleDeleteConfirmationModal = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("peopleModule", "jobFamily");

  const {
    previousJobTitleData,
    currentEditingJobFamily,
    setJobFamilyModalType,
    setCurrentEditingJobFamily,
    setPreviousJobTitleData,
    setCurrentTransferMembersData
  } = usePeopleStore((state) => state);

  const onSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.DELETE_JOB_TITLE_SUCCESS,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.DELETE_JOB_TITLE_ERROR,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const { mutate: deleteJobTitleMutate } = useDeleteJobTitle(
    onSuccess,
    onError
  );

  return (
    <UserPromptModal
      description={translateText([
        "jobTitleDeleteConfirmationModalDescription"
      ])}
      primaryBtn={{
        label: translateText(["jobTitleDeleteConfirmationModalBtn"]),
        onClick: () =>
          deleteJobTitleMutate(previousJobTitleData?.jobTitleId ?? 0),
        endIcon: IconName.DELETE_BUTTON_ICON,
        buttonStyle: ButtonStyle.ERROR
      }}
      secondaryBtn={{
        label: translateText(["cancelBtnText"]),
        onClick: () =>
          handleJobTitleDeleteBackBtnClick(
            previousJobTitleData,
            currentEditingJobFamily,
            setJobFamilyModalType,
            setPreviousJobTitleData,
            setCurrentEditingJobFamily,
            setCurrentTransferMembersData
          ),
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default JobTitleDeleteConfirmationModal;
