import { Stack } from "@mui/material";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useReactivateTerminatedUser } from "~community/people/api/PeopleApi";

interface ReactivateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
}

const ReactivateConfirmationModal: React.FC<
  ReactivateConfirmationModalProps
> = ({ isOpen, onClose, employeeId }) => {
  const translateText = useTranslator("peopleModule", "termination");
  const { setToastMessage } = useToast();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["reactivateSuccessTitle"]),
      description: translateText(["reactivateSuccessDescription"]),
      isIcon: true
    });
    onClose();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["reactivateErrorTitle"]),
      description: translateText(["reactivateErrorDescription"]),
      isIcon: true
    });
    onClose();
  };

  const { mutate: reactivateEmployee } = useReactivateTerminatedUser(
    onSuccess,
    onError,
    employeeId
  );

  const onClick = () => {
    reactivateEmployee();
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={translateText(["reactivateConfirmationModalTitle"])}
      icon={<Icon name={IconName.RESTORE_ICON} />}
      ids={{
        title: "user-prompt-modal-title",
        description: "user-prompt-modal-description",
        closeButton: "user-prompt-modal-close-button"
      }}
    >
      <Stack spacing={2}>
        <UserPromptModal
          description={translateText([
            "reactivateConfirmationModalDescription"
          ])}
          primaryBtn={{
            label: translateText(["reactivateButtonText"]),
            buttonStyle: ButtonStyle.PRIMARY,
            endIcon: IconName.RESTORE_ICON,
            onClick: onClick
          }}
          secondaryBtn={{
            label: translateText(["cancelButtonText"]),
            buttonStyle: ButtonStyle.TERTIARY,
            endIcon: IconName.CLOSE_ICON,
            onClick: onClose
          }}
        />
      </Stack>
    </Modal>
  );
};

export default ReactivateConfirmationModal;
