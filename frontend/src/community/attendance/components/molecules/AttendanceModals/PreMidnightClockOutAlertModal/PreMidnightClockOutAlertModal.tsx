import { Box, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  closeModal: () => void;
}

const PreMidnightClockOutAlertModal: FC<Props> = ({ closeModal }) => {
  const translateText = useTranslator("attendanceModule", "timeWidget");
  const classes = styles();
  const handleOkay = (): void => {
    closeModal();
  };

  return (
    <>
      <Box component="div">
        <Box component="div" sx={classes.headerContainer}>
          <Typography
            id="modal-title"
            variant="h5"
            align="center"
            sx={classes.headerText}
          >
            {translateText(["clockOutAlert"])}
          </Typography>
        </Box>
        <Box sx={classes.bodyContainer}>
          <Typography variant="body2" sx={classes.bodyText}>
            {translateText(["clockOutAlertMessage"])}
          </Typography>
          <Stack spacing={2}>
            <Button onClick={handleOkay} aria-label={translateText(["ok"])} icon={<Icon name={IconName.CHECK_ICON} />} iconPosition="end">{translateText(["ok"])}</Button>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default PreMidnightClockOutAlertModal;
