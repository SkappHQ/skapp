import { Stack, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: IconName;
  cancelIcon?: IconName;
  confirmButtonStyle?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "tertiary"
    | "transparent";
  cancelButtonStyle?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "tertiary"
    | "transparent";
  isClosable?: boolean;
  isIconVisible?: boolean;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmIcon = IconName.RIGHT_ARROW_ICON,
  cancelIcon = IconName.CLOSE_ICON,
  confirmButtonStyle = "primary",
  cancelButtonStyle = "tertiary",
  isClosable = false,
  isIconVisible = false
}) => {
  const translateText = useTranslator("common", "settings");
  const confirmText = confirmLabel || translateText(["confirmBtn"]);
  const cancelText = cancelLabel || translateText(["cancelBtn"]);

  return (
    <Modal
      isModalOpen={isOpen}
      onCloseModal={onClose}
      title={title}
      isIconVisible={isIconVisible}
      isClosable={isClosable}
    >
      <Stack spacing={2}>
        <Typography variant="body1" color="text.primary">
          {description}
        </Typography>

        <Stack direction="column" spacing={2}>
          <ButtonV2
            variant={confirmButtonStyle}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            icon={<Icon name={confirmIcon} />}
            iconPosition="end"
          >
            {confirmText}
          </ButtonV2>

          <ButtonV2
            variant={cancelButtonStyle}
            onClick={onClose}
            disabled={isLoading}
            icon={<Icon name={cancelIcon} />}
            iconPosition="end"
          >
            {cancelText}
          </ButtonV2>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ConfirmationModal;
