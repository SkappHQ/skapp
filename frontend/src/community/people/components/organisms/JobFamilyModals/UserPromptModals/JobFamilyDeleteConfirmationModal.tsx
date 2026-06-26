import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteJobFamily } from "~community/people/api/JobFamilyApi";
import { JobFamilyToastEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { handleJobFamilyApiResponse } from "~community/people/utils/jobFamilyUtils/apiUtils";
import { handleJobFamilyDeleteBackBtnClick } from "~community/people/utils/jobFamilyUtils/jobFamilyUtils";

const JobFamilyDeleteConfirmationModal = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("peopleModule", "jobFamily");

  const {
    currentDeletingJobFamily,
    setCurrentDeletingJobFamily,
    setJobFamilyModalType
  } = usePeopleStore((state) => state);

  const onSuccess = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.DELETE_JOB_FAMILY_SUCCESS,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const onError = () => {
    handleJobFamilyApiResponse({
      type: JobFamilyToastEnums.DELETE_JOB_FAMILY_ERROR,
      setJobFamilyModalType,
      setToastMessage,
      translateText
    });
  };

  const { mutate: deleteJobFamilyMutate } = useDeleteJobFamily(
    onSuccess,
    onError
  );

  return (
    <UserPromptModal
      description={translateText([
        "jobFamilyDeleteConfirmationModalDescription"
      ])}
      primaryBtn={{
        label: translateText(["jobFamilyDeleteConfirmationModalBtn"]),
        onClick: () =>
          deleteJobFamilyMutate(currentDeletingJobFamily?.jobFamilyId ?? 0),
        endIcon: IconName.DELETE_BUTTON_ICON,
        buttonStyle: ButtonStyle.ERROR
      }}
      secondaryBtn={{
        label: translateText(["cancelBtnText"]),
        onClick: () =>
          handleJobFamilyDeleteBackBtnClick(
            setCurrentDeletingJobFamily,
            setJobFamilyModalType
          ),
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default JobFamilyDeleteConfirmationModal;
