import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useReactivateTerminatedUser } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const TerminatedToActiveUserConfirmationModal = () => {
  const translateText = useTranslator("peopleModule", "peoples");

  const {
    setDirectoryModalType,
    setPendingAddResourceData,
    pendingAddResourceData
  } = usePeopleStore((state) => ({
    setDirectoryModalType: state.setDirectoryModalType,
    setPendingAddResourceData: state.setPendingAddResourceData,
    pendingAddResourceData: state.pendingAddResourceData
  }));

  const handleSuccess = () => {
    setPendingAddResourceData(null);
    setDirectoryModalType(DirectoryModalTypes.NONE);
  };

  const { mutate, isPending } = useReactivateTerminatedUser(
    handleSuccess,
  );

  const handleConfirm = () => {
    if (!pendingAddResourceData?.email) return;
    mutate(pendingAddResourceData.email);
  };

  const handleCancel = () => {
    setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
  };

  return (
    <UserPromptModal
      description={translateText(["terminatedUserConfirmationModalDescription"])}
      primaryBtn={{
        label: translateText(["terminatedUserConfirmationModalContinueBtn"]),
        onClick: handleConfirm,
        isDisabled: isPending,
        endIcon: IconName.RIGHT_ARROW_ICON
      }}
      secondaryBtn={{
        label: translateText(["terminatedUserConfirmationModalCancelBtn"]),
        onClick: handleCancel,
        isDisabled: isPending,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default TerminatedToActiveUserConfirmationModal;
