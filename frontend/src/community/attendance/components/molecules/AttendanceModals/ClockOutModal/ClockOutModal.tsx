import { Box, Stack, Typography, useTheme } from "@mui/material";
import { FC } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  calculateWorkedDuration,
  calculateWorkedDurationInHoursAndMinutes
} from "~community/attendance/utils/CalculateWorkedDuration";
import Button from "~community/common/components/atoms/Button/Button";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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

  const { isPending, mutate } = useUpdateEmployeeStatus();

  const handleProceedHome = (): void => {
    mutate(setSlotType(AttendanceSlotType.END));
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
            <Button
              label={translateText(["confirm"])}
              endIcon={IconName.RIGHT_ARROW_ICON}
              onClick={handleProceedHome}
              ariaLabel={translateText(["confirm"])}
              isLoading={isPending}
              buttonStyle={ButtonStyle.PRIMARY}
              accessibility={{
                ariaHidden: true
              }}
            />
            <Button
              buttonStyle={ButtonStyle.TERTIARY}
              label={translateText(["cancel"])}
              endIcon={IconName.CLOSE_ICON}
              onClick={handleUndoClockOut}
              ariaLabel={translateText(["cancel"])}
              accessibility={{
                ariaHidden: true
              }}
            />
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ClockOutModal;
