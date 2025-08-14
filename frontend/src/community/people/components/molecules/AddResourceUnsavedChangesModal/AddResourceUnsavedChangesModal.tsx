import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const AddResourceUnsavedChangesModal = () => {
  const {
    setDirectoryModalType
    // pendingResourceAction,
    // setPendingResourceAction
  } = usePeopleStore((state) => ({
    setDirectoryModalType: state.setDirectoryModalType
    // pendingResourceAction: state.pendingResourceAction,
    // setPendingResourceAction: state.setPendingResourceAction
  }));

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const handleResumeBtnClick = () => {
    // setPendingResourceAction(null);
    setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
  };

  const handleLeaveAnywayBtnClick = () => {
    // if (pendingResourceAction) {
    //   pendingResourceAction();
    // }
    // setPendingResourceAction(null);
    setDirectoryModalType(DirectoryModalTypes.NONE);
    stopAllOngoingQuickSetup();
  };

  return (
    <AreYouSureModal
      onPrimaryBtnClick={handleResumeBtnClick}
      onSecondaryBtnClick={handleLeaveAnywayBtnClick}
    />
  );
};

export default AddResourceUnsavedChangesModal;
