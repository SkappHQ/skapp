import { Box, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  calculateWorkedDuration,
  calculateWorkedDurationInHoursAndMinutes
} from "~community/attendance/utils/CalculateWorkedDuration";
import { Button } from "@rootcodelabs/skapp-ui";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  closeModal: () => void;
}

const AutoClockOutMidnightModal: FC<Props> = ({ closeModal }) => {
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

  const handleClockinAgain = (): void => {
    mutate(setSlotType(AttendanceSlotType.START));
    closeModal();
  };

  const handleCancel = (): void => {
    closeModal();
  };

  const workedHours = calculateWorkedDurationInHoursAndMinutes(
    calculateWorkedDuration(attendanceParams)
  );

  return (
    <>
      <Box component="div">
        <Box sx={classes.container}>
          <Typography variant="body2" sx={classes.headerText}>
            {translateText(["autoClockedOutMessage"])}
          </Typography>
          <Box sx={classes.bodyContainer}>
            <Stack
              direction="row"
              justifyContent="flex-start"
              spacing={1}
              alignItems="center"
              component="div"
              tabIndex={0}
            >
              <Typography variant="body2" sx={{ fontSize: ".875rem" }}>
                {translateText(["clockOutTime"])}:
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconChip
                  icon={<Icon name={IconName.CLOCK_ICON} />}
                  label={clockOutTime}
                  chipStyles={classes.iconChipStyles}
                />
              </Stack>
              <Typography variant="body2" sx={classes.workHourStyles}>
                {translateText(["workedHours"])}:
              </Typography>
              <Stack direction="row" spacing={1}>
                <BasicChip
                  label={workedHours}
                  chipStyles={classes.basicChipStyles}
                />
              </Stack>
            </Stack>
          </Box>
          <Stack spacing={2}>
            <Button onClick={handleClockinAgain} aria-label={translateText(["clockInAgain"])} isLoading={isPending} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["clockInAgain"])}</Button>
            <Button variant={"tertiary"} onClick={handleCancel} aria-label={translateText(["cancel"])} icon={<Icon name={IconName.CLOSE_ICON} />} iconPosition="end">{translateText(["cancel"])}</Button>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default AutoClockOutMidnightModal;
