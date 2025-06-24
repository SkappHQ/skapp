import { Stack } from "@mui/material";
import React from "react";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface LeaveRequestRevokeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
}

const LeaveRequestRevokeConfirmationModal: React.FC<
  LeaveRequestRevokeConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, title, content }) => {
  const translateText = useTranslator("configurations", "times");

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={title}
      isClosable={false}
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
            label: translateText([
              "leaveRequestRevokeModalConfirmationButtonText"
            ]),
            buttonStyle: ButtonStyle.PRIMARY,
            endIcon: IconName.RIGHT_ARROW_ICON,
            styles: { mt: "1rem" },
            onClick: onConfirm
          }}
          secondaryBtn={{
            label: translateText(["leaveRequestRevokeModalCancelButtonText"]),
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

export default LeaveRequestRevokeConfirmationModal;
