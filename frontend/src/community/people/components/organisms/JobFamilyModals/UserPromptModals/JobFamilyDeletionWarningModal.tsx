import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { handleJobFamilyDeleteBackBtnClick } from "~community/people/utils/jobFamilyUtils/jobFamilyUtils";

const JobFamilyDeletionWarningModal = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setCurrentDeletingJobFamily, setJobFamilyModalType } = usePeopleStore(
    (state) => state
  );

  return (
    <UserPromptModal
      description={translateText(["jobFamilyDeletionWarningModalDescription"])}
      primaryBtn={{
        label: translateText(["transferMembers"]),
        onClick: () =>
          setJobFamilyModalType(
            JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS
          ),
        endIcon: IconName.CHANGE_ICON
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

export default JobFamilyDeletionWarningModal;
