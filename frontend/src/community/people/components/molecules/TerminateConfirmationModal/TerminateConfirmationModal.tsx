import { Stack } from "@mui/material";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useTerminateUser } from "~community/people/api/PeopleApi";

interface TerminateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TerminateConfirmationModal: React.FC<TerminateConfirmationModalProps> = ({
  isOpen,
  onClose
}) => {
  const translateText = useTranslator("peopleModule", "termination");
  const { setToastMessage } = useToast();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["terminateSuccessTitle"]),
      description: translateText(["terminateSuccessDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["terminateErrorTitle"]),
      description: translateText(["terminateErrorDescription"]),
      isIcon: true
    });
    onClose();
  };

  const { mutate: terminateEmployee } = useTerminateUser(onSuccess, onError);

  const onClick = () => {
    terminateEmployee();
  };

  return (
    <>
      <Modal
        isModalOpen={isOpen}
        onCloseModal={onClose}
        title={translateText(["terminateConfirmationModalTitle"])}
        icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
        ids={{
          title: "user-prompt-modal-title",
          description: "user-prompt-modal-description",
          closeButton: "user-prompt-modal-close-button"
        }}
      >
        <Stack spacing={2}>
          <UserPromptModal
            description={translateText([
              "terminateConfirmationModalDescription"
            ])}
            primaryBtn={{
              label: translateText(["terminateButtonText"]),
              buttonStyle: ButtonStyle.ERROR,
              endIcon: IconName.DELETE_BUTTON_ICON,
              styles: { mt: "1rem" },
              onClick: onClick
            }}
            secondaryBtn={{
              label: translateText(["cancelButtonText"]),
              buttonStyle: ButtonStyle.TERTIARY,
              endIcon: IconName.CLOSE_ICON,
              styles: { mt: "1rem" },
              onClick: onClose
            }}
          />
        </Stack>
      </Modal>
    </>
  );
};

export default TerminateConfirmationModal;
