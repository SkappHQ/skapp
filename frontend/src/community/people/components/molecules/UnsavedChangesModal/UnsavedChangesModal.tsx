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
  onDiscard: () => void;
  onSave: () => void;
}

const UnsavedChangesModal: React.FC<Props> = ({
  isOpen,
  onDiscard,
  onSave
}) => {
  const translateText = useTranslator("peopleModule", "peoples");

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onDiscard}
      isClosable={false}
      title={translateText(["unsavedModalTitle"])}
      icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-button"
      }}
    >
      <Stack spacing={2}>
        <UserPromptModal
          description={translateText(["unsavedModalDescription"])}
          primaryBtn={{
            label: translateText(["unsavedModalSaveButton"]),
            buttonStyle: ButtonStyle.PRIMARY,
            endIcon: IconName.RIGHT_MARK,
            styles: { mt: "1rem" },
            onClick: onSave
          }}
          secondaryBtn={{
            label: translateText(["unsavedModalDiscardButton"]),
            buttonStyle: ButtonStyle.TERTIARY,
            endIcon: IconName.CLOSE_ICON,
            styles: { mt: "1rem" },
            onClick: onDiscard
          }}
        />
      </Stack>
    </Modal>
  );
};

export default UnsavedChangesModal;
