import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useQuickAddEmployeeMutation } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { QuickAddEmployeePayload } from "~community/people/types/EmployeeTypes";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const GuestToInternalUserConfirmationModal = () => {
  const translateText = useTranslator("peopleModule", "peoples");

  const { setDirectoryModalType, setPendingAddResourceData, pendingAddResourceData } =
    usePeopleStore((state) => ({
      setDirectoryModalType: state.setDirectoryModalType,
      setPendingAddResourceData: state.setPendingAddResourceData,
      pendingAddResourceData: state.pendingAddResourceData
    }));

  const { ongoingQuickSetup, setQuickSetupModalType, stopAllOngoingQuickSetup } =
    useCommonEnterpriseStore((state) => ({
      ongoingQuickSetup: state.ongoingQuickSetup,
      setQuickSetupModalType: state.setQuickSetupModalType,
      stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
    }));

  const handleSuccess = () => {
    setPendingAddResourceData(null);
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
      stopAllOngoingQuickSetup();
    }
  };

  const { mutate, isPending } = useQuickAddEmployeeMutation(handleSuccess);

  const handleConfirm = () => {
    if (!pendingAddResourceData) return;
    const payload: QuickAddEmployeePayload = {
      firstName: pendingAddResourceData.firstName,
      lastName: pendingAddResourceData.lastName,
      email: pendingAddResourceData.email
    };
    mutate(payload);
  };

  const handleCancel = () => {
    setDirectoryModalType(DirectoryModalTypes.ADD_NEW_RESOURCE);
  };

  return (
    <UserPromptModal
      description={translateText(["guestUserConfirmationModalDescription"])}
      primaryBtn={{
        label: translateText(["guestUserConfirmationModalContinueBtn"]),
        onClick: handleConfirm,
        isDisabled: isPending,
        endIcon: IconName.RIGHT_ARROW_ICON
      }}
      secondaryBtn={{
        label: translateText(["guestUserConfirmationModalCancelBtn"]),
        onClick: handleCancel,
        endIcon: IconName.CLOSE_ICON
      }}
    />
  );
};

export default GuestToInternalUserConfirmationModal;
