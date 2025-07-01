import { Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import UserPromptModal from "~community/common/components/molecules/UserPromptModal/UserPromptModal";
import Modal from "~community/common/components/organisms/Modal/Modal";
import ROUTES from "~community/common/constants/routes";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { useDeleteUser } from "~community/people/api/PeopleApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UserDeletionConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const translateText = useTranslator("peopleModule", "deletion");
  const { setToastMessage } = useToast();
  const router = useRouter();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["deleteSuccessTitle"]),
      description: translateText(["deleteSuccessDescription"]),
      isIcon: true
    });
    router.push(ROUTES.PEOPLE.DIRECTORY);
    onClose();
  };

  const onError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["deleteErrorTitle"]),
      description: translateText(["deleteErrorDescription"]),
      isIcon: true
    });
    onClose();
  };

  const { mutate: deleteUser } = useDeleteUser(onSuccess, onError);

  const onClick = () => {
    deleteUser();
  };

  return (
    <>
      <Modal
        isModalOpen={isOpen}
        onCloseModal={onClose}
        isClosable={false}
        title={translateText(["deleteConfirmationModalTitle"])}
        icon={<Icon name={IconName.CLOSE_STATUS_POPUP_ICON} />}
        ids={{
          title: "user-prompt-modal-title",
          description: "user-prompt-modal-description",
          closeButton: "user-prompt-modal-close-button"
        }}
      >
        <Stack spacing={2}>
          <UserPromptModal
            description={translateText(["deleteConfirmationModalDescription"])}
            primaryBtn={{
              label: translateText(["deleteButtonLabel"]),
              buttonStyle: ButtonStyle.ERROR,
              endIcon: IconName.DELETE_BUTTON_ICON,
              styles: { mt: "1rem" },
              onClick: onClick
            }}
            secondaryBtn={{
              label: translateText(["cancelButtonLabel"]),
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

export default UserDeletionConfirmationModal;
