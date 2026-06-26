import { Box, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

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
          <ButtonV2
            onClick={onConfirmDisconnect}
            icon={<Icon name={IconName.TICK_ICON} />}
            iconPosition="end"
          >
            {translateText(["confirmBtn"])}
          </ButtonV2>
          <ButtonV2
            onClick={onCloseModal}
            variant={"tertiary"}
            icon={<Icon name={IconName.CLOSE_ICON} />}
            iconPosition="end"
          >
            {translateText(["cancelBtn"])}
          </ButtonV2>
        </Box>
      </Box>
    </Modal>
  );
};

export default CalendarDisconnectModal;
