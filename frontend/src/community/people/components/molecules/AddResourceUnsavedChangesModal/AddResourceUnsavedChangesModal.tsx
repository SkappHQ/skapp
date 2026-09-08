import { useShallow } from "zustand/react/shallow";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const AddResourceUnsavedChangesModal = () => {
  const { setDirectoryModalType, setPendingAddResourceData } = usePeopleStore(
    useShallow((state) => ({
      setDirectoryModalType: state.setDirectoryModalType,
      setPendingAddResourceData: state.setPendingAddResourceData
    }))
  );

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore(
    useShallow((state) => ({
      stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
    }))
  );

  const handleResumeBtnClick = () => {
    setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
  };

  const handleLeaveAnywayBtnClick = () => {
    setPendingAddResourceData(null);
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
