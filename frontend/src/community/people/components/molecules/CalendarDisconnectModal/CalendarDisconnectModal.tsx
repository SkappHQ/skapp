import { Box, Typography } from "@mui/material";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Modal from "~community/common/components/organisms/Modal/Modal";
import { CalendarType } from "~community/common/enums/CommonEnums";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface CalendarDisconnectModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onConfirmDisconnect: () => void;
  calendarType?: CalendarType;
}

const CalendarDisconnectModal = ({
  isModalOpen,
  onCloseModal,
  onConfirmDisconnect,
  calendarType
}: CalendarDisconnectModalProps) => {
  const translateText = useTranslator("settings");

  return (
    <Modal
      isModalOpen={isModalOpen}
      onCloseModal={onCloseModal}
      title={translateText(["confirmDisconnectTitle"])}
    >
      <Box>
        <Typography>
          {calendarType === CalendarType.GOOGLE
            ? translateText(["confirmGoogleDisconnectMessage"])
            : translateText(["confirmMicrosoftDisconnectMessage"])}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            mt: 2
          }}
        >
          <Button onClick={onConfirmDisconnect} icon={<Icon name={IconName.TICK_ICON} />} iconPosition="end">{translateText(["confirmBtn"])}</Button>
          <Button onClick={onCloseModal} variant={"tertiary"} icon={<Icon name={IconName.CLOSE_ICON} />} iconPosition="end">{translateText(["cancelBtn"])}</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CalendarDisconnectModal;
