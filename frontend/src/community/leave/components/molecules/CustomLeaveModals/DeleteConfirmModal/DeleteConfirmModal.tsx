import { SmallModal } from "@rootcodelabs/skapp-ui";
import React from "react";

import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
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
    <SmallModal
      isOpen={open}
      onClose={onClose}
      modalHeader={title}
      content={
        <UserPromptModal
          description={content}
          primaryBtn={{
            label: translateText(["deleteBtnTextAllocation"]),
            buttonStyle: ButtonStyle.ERROR,
            endIcon: IconName.DELETE_BUTTON_ICON,
            onClick: onConfirm
          }}
          secondaryBtn={{
            label: translateText(["cancelBtn"]),
            buttonStyle: ButtonStyle.TERTIARY,
            endIcon: IconName.CLOSE_ICON,
            onClick: onClose
          }}
        />
      }
    />
  );
};

export default DeleteConfirmationModal;
