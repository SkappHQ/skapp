import { Stack } from "@mui/material";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onClick: () => void;
}

const UserDeletionWarningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  message,
  onClick
}) => {
  const translateText = useTranslator("peopleModule", "deletion");

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={translateText(["deleteWarningTitle"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-button"
      }}
    >
      <Stack spacing={2}>
        <UserPromptModal
          description={message}
          primaryBtn={{
            label: translateText(["okayButtonLabel"]),
            buttonStyle: ButtonStyle.PRIMARY,
            endIcon: IconName.TICK_ICON,
            styles: { mt: "1rem" },
            onClick: onClick
          }}
        />
      </Stack>
    </Modal>
  );
};

export default UserDeletionWarningModal;
