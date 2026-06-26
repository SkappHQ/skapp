import { useMemo } from "react";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";

const AddNewJobTitle = () => {
  const translateText = useTranslator("peopleModule", "jobFamily");

  const { currentEditingJobFamily, setJobFamilyModalType } = usePeopleStore(
    (state) => state
  );

  const isNewJobFamily = useMemo(() => {
    return !currentEditingJobFamily?.jobFamilyId;
  }, [currentEditingJobFamily]);

  return (
    <UserPromptModal
      description={translateText(["addNewTitleModalDescription"])}
      primaryBtn={{
        label: translateText(["okayBtnText"]),
        onClick: () =>
          setJobFamilyModalType(
            isNewJobFamily
              ? JobFamilyActionModalEnums.ADD_JOB_FAMILY
              : JobFamilyActionModalEnums.EDIT_JOB_FAMILY
          ),
        endIcon: IconName.RIGHT_ARROW_ICON
      }}
    />
  );
};

export default AddNewJobTitle;
