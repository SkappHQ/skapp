import { Stack, Typography } from "@mui/material";
import { FC, ReactNode } from "react";



import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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
  confirmButtonStyle?: ButtonStyle;
  cancelButtonStyle?: ButtonStyle;
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
  confirmButtonStyle = ButtonStyle.PRIMARY,
  cancelButtonStyle = ButtonStyle.TERTIARY,
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
          <Button
            label={confirmText}
            buttonStyle={confirmButtonStyle}
            endIcon={<Icon name={confirmIcon} />}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <Button
            label={cancelText}
            buttonStyle={cancelButtonStyle}
            endIcon={<Icon name={cancelIcon} />}
            onClick={onClose}
            disabled={isLoading}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ConfirmationModal;