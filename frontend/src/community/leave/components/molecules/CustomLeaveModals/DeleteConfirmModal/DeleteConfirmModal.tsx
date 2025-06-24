import { Stack } from "@mui/material";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content
}) => {
  const translateText = useTranslator("leaveModule", "customLeave");

  return (
    <Modal
      isModalOpen={open}
      onCloseModal={onClose}
      title={title}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-button"
      }}
    >
      <Stack spacing={2}>
        <UserPromptModal
          description={content}
          primaryBtn={{
            label: translateText(["deleteBtnTextAllocation"]),
            buttonStyle: ButtonStyle.ERROR,
            endIcon: IconName.DELETE_BUTTON_ICON,
            styles: { mt: "1rem" },
            onClick: onConfirm
          }}
          secondaryBtn={{
            label: translateText(["cancelBtn"]),
            buttonStyle: ButtonStyle.TERTIARY,
            endIcon: IconName.CLOSE_ICON,
            styles: { mt: "1rem" },
            onClick: onClose
          }}
        />
      </Stack>
    </Modal>
  );
};

export default DeleteConfirmationModal;
