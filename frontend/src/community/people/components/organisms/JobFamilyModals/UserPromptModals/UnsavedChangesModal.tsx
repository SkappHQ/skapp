import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const UnsavedChangesModal = () => {
  const { jobFamilyModalType, setJobFamilyModalType } = usePeopleStore(
    (state) => ({
      jobFamilyModalType: state.jobFamilyModalType,
      setJobFamilyModalType: state.setJobFamilyModalType
    })
  );

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const handleCancelBtnClick = () => {
    const modalTypeMap = {
      [JobFamilyActionModalEnums.UNSAVED_CHANGES_ADD_JOB_FAMILY]:
        JobFamilyActionModalEnums.ADD_JOB_FAMILY,
      [JobFamilyActionModalEnums.UNSAVED_CHANGES_EDIT_JOB_FAMILY]:
        JobFamilyActionModalEnums.EDIT_JOB_FAMILY,
      [JobFamilyActionModalEnums.UNSAVED_CHANGES_JOB_FAMILY_TRANSFER_MEMBERS]:
        JobFamilyActionModalEnums.JOB_FAMILY_TRANSFER_MEMBERS,
      [JobFamilyActionModalEnums.UNSAVED_CHANGED_JOB_TITLE_TRANSFER_MEMBERS]:
        JobFamilyActionModalEnums.JOB_TITLE_TRANSFER_MEMBERS
    };

    const newModalType =
      modalTypeMap[jobFamilyModalType as keyof typeof modalTypeMap];
    if (newModalType) {
      setJobFamilyModalType(newModalType);
    }
  };

  const handleSubmitBtnClick = () => {
    setJobFamilyModalType(JobFamilyActionModalEnums.NONE);
    stopAllOngoingQuickSetup();
  };

  return (
    <AreYouSureModal
      onPrimaryBtnClick={handleCancelBtnClick}
      onSecondaryBtnClick={handleSubmitBtnClick}
    />
  );
};

export default UnsavedChangesModal;
