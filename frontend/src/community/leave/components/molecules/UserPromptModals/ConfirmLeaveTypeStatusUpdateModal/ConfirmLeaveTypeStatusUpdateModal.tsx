import { useMemo } from "react";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useEditLeaveType } from "~community/leave/api/LeaveTypesApi";
import { LeaveTypeModalEnums } from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeFormDataType } from "~community/leave/types/AddLeaveTypes";

interface Props {
  values: LeaveTypeFormDataType;
  mutate: ReturnType<typeof useEditLeaveType>["mutate"];
}

const ConfirmLeaveTypeStatusUpdateModal = ({ values, mutate }: Props) => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const {
    editingLeaveType,
    leaveTypeModalType,
    setLeaveTypeModalType,
    setEditingLeaveType
  } = useLeaveStore((state) => state);

  const onSaveBtnClick = () => {
    const { typeId, ...rest } = values;

    const payload = {
      ...rest,
      isActive: editingLeaveType.isActive
    };

    mutate({
      leaveType: payload,
      id: typeId
    });
    setLeaveTypeModalType(LeaveTypeModalEnums.NONE);
  };

  const onCancelBtnClick = () => {
    setEditingLeaveType({
      ...editingLeaveType,
      isActive: !editingLeaveType.isActive
    });
    setLeaveTypeModalType(LeaveTypeModalEnums.NONE);
  };

  const title = useMemo(() => {
    return editingLeaveType.isActive
      ? translateText(["activateLeaveTypeModalTitle"])
      : translateText(["inactivateLeaveTypeModalTitle"]);
  }, [editingLeaveType.isActive, translateText]);

  const description = useMemo(() => {
    return editingLeaveType.isActive
      ? translateText(["activateLeaveTypeModalDescription"])
      : translateText(["inactivateLeaveTypeModalDescription"]);
  }, [editingLeaveType.isActive, translateText]);

  const isModalOpen =
    leaveTypeModalType === LeaveTypeModalEnums.INACTIVATE_LEAVE_TYPE ||
    leaveTypeModalType === LeaveTypeModalEnums.ACTIVATE_LEAVE_TYPE;

  return (
    <Modal
      isModalOpen={isModalOpen}
      onCloseModal={() => setLeaveTypeModalType(LeaveTypeModalEnums.NONE)}
      title={title}
      isClosable={false}
      isDividerVisible={true}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-button"
      }}
    >
      <UserPromptModal
        description={description}
        primaryBtn={{
          label: translateText(["confirmAndSaveBtn"]),
          onClick: onSaveBtnClick
        }}
        secondaryBtn={{
          label: translateText(["cancelBtn"]),
          onClick: onCancelBtnClick
        }}
      />
    </Modal>
  );
};

export default ConfirmLeaveTypeStatusUpdateModal;
