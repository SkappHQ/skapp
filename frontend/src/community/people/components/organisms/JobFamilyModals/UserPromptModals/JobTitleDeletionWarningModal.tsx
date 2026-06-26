import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { handleJobTitleDeleteBackBtnClick } from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

const JobTitleDeletionWarningModal = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const {
    previousJobTitleData,
    currentEditingJobFamily,
    setCurrentEditingJobFamily,
    setJobFamilyModalType,
    setPreviousJobTitleData,
    setCurrentTransferMembersData
  } = usePeopleStore((state) => state);

  return (
    <UserPromptModal
      description={translateText(["jobTitleDeletionWarningDescription"])}
      primaryBtn={{
        label: translateText(["transferMembers"]),
        onClick: () =>
          setJobFamilyModalType(
            JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS
          ),
        endIcon: IconName.CHANGE_ICON
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

export default JobTitleDeletionWarningModal;
