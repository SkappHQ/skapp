import { Box, Stack, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  calculateWorkedDuration,
  calculateWorkedDurationInHoursAndMinutes
} from "~community/attendance/utils/CalculateWorkedDuration";
import { useAttendanceAction } from "~community/attendance/hooks/useAttendanceAction";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  closeModal: () => void;
}

const ClockOutModal: FC<Props> = ({ closeModal }) => {
  const theme = useTheme();

  const { setSlotType, attendanceParams } = useAttendanceStore(
    (state) => state
  );
  const classes = styles();
  const clockOutTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const translateText = useTranslator("attendanceModule", "timeWidget");

  const { recordAttendance, isPending } = useAttendanceAction();

  const handleProceedHome = (): void => {
    const slotType = setSlotType(AttendanceSlotType.END);
    recordAttendance(slotType);
    closeModal();
  };

  const handleUndoClockOut = (): void => {
    closeModal();
  };

  const workedHours = calculateWorkedDurationInHoursAndMinutes(
    calculateWorkedDuration(attendanceParams)
  );

  return (
    <>
      <Box component="div">
        <Box sx={classes.mainContainer}>
          <Box sx={classes.headerContainer}>
            <Stack
              direction="row"
              justifyContent="flex-start"
              spacing={1}
              alignItems="center"
              component="div"
            >
              <Typography variant="body2" sx={classes.headerText}>
                {translateText(["clockOutTime"])}:
              </Typography>
              <div
                style={{
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: "9.375rem",
                  padding: "0.5rem 1rem"
                }}
              >
                {clockOutTime}
              </div>
              <Typography variant="body2" sx={classes.headerText}>
                {translateText(["workedHours"])}:
              </Typography>
              <div
                style={{
                  backgroundColor: theme.palette.grey[100],
                  borderRadius: "9.375rem",
                  padding: "0.5rem 1rem"
                }}
              >
                {workedHours}
              </div>
            </Stack>
          </Box>
          <Typography variant="body2" sx={classes.messageText}>
            {translateText(["clockOutConfirmationMessage"])}
          </Typography>
          <Stack spacing={2}>
            <ButtonV2
              onClick={handleProceedHome}
              aria-label={translateText(["confirm"])}
              isLoading={isPending}
              variant={"primary"}
              icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              iconPosition="end"
            >
              {translateText(["confirm"])}
            </ButtonV2>
            <ButtonV2
              variant={"tertiary"}
              onClick={handleUndoClockOut}
              aria-label={translateText(["cancel"])}
              icon={<Icon name={IconName.CLOSE_ICON} />}
              iconPosition="end"
            >
              {translateText(["cancel"])}
            </ButtonV2>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ClockOutModal;
