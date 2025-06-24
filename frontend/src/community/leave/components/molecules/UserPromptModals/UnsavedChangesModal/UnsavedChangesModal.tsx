import { useRouter } from "next/navigation";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { LeaveTypeModalEnums } from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const ExitModal = () => {
  const router = useRouter();

  const translateText = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );

  const {
    leaveTypeModalType,
    pendingNavigation,
    setLeaveTypeModalType,
    resetEditingLeaveType
  } = useLeaveStore((state) => ({
    leaveTypeModalType: state.leaveTypeModalType,
    pendingNavigation: state.pendingNavigation,
    setLeaveTypeModalType: state.setLeaveTypeModalType,
    resetEditingLeaveType: state.resetEditingLeaveType
  }));

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const handleOnSecondaryBtnClick = async () => {
    stopAllOngoingQuickSetup();
    setLeaveTypeModalType(LeaveTypeModalEnums.NONE);
    await router.push(pendingNavigation);
    resetEditingLeaveType();
  };

  return (
    <Modal
      isModalOpen={
        leaveTypeModalType === LeaveTypeModalEnums.UNSAVED_CHANGES_MODAL
      }
      onCloseModal={() => setLeaveTypeModalType(LeaveTypeModalEnums.NONE)}
      title={translateText(["title"])}
      isClosable={false}
      isDividerVisible={true}
      modalWrapperStyles={{
        zIndex: ZIndexEnums.MODAL
      }}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-btn"
      }}
    >
      <AreYouSureModal
        onPrimaryBtnClick={() =>
          setLeaveTypeModalType(LeaveTypeModalEnums.NONE)
        }
        onSecondaryBtnClick={handleOnSecondaryBtnClick}
      />
    </Modal>
  );
};

export default ExitModal;
