import { Box, Typography } from "@mui/material";

import Button from "~community/common/components/atoms/Button/Button";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface OutlookCalendarDisconnectModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onConfirmDisconnect: () => void;
}

const OutlookCalendarDisconnectModal = ({
  isModalOpen,
  onCloseModal,
  onConfirmDisconnect
}: OutlookCalendarDisconnectModalProps) => {
  const translateText = useTranslator("settings");

  return (
    <Modal
      isModalOpen={isModalOpen}
      onCloseModal={onCloseModal}
      title={translateText(["confirmDisconnectTitle"])}
    >
      <Box>
        <Typography>{translateText(["confirmDisconnectMessage"])}</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            mt: 2
          }}
        >
          <Button
            label={translateText(["confirmBtn"])}
            onClick={onConfirmDisconnect}
            endIcon={IconName.TICK_ICON}
          />
          <Button
            label={translateText(["cancelBtn"])}
            onClick={onCloseModal}
            buttonStyle={ButtonStyle.TERTIARY}
            endIcon={IconName.CLOSE_ICON}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default OutlookCalendarDisconnectModal;
