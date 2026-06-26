import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";

const AddNewJobFamily = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { setJobFamilyModalType } = usePeopleStore((state) => state);

  return (
    <UserPromptModal
      description={translateText(["addNewJobFamilyModalDescription"])}
      primaryBtn={{
        label: translateText(["addNewJobFamilyBtn"]),
        onClick: () =>
          setJobFamilyModalType(JobFamilyActionModalEnums.ADD_JOB_FAMILY),
        endIcon: IconName.RIGHT_ARROW_ICON
      }}
      secondaryBtn={{
        label: translateText(["cancelBtnText"]),
        onClick: () => setJobFamilyModalType(JobFamilyActionModalEnums.NONE),
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default AddNewJobFamily;
