import { Box, Stack, Typography } from "@mui/material";
import { JSX } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  closeModal: () => void;
}

const LeaveClockInModal = ({ closeModal }: Props): JSX.Element => {
  const leave = useAttendanceStore((state) => state.attendanceLeaveStatus);
  const setSlotType = useAttendanceStore((state) => state.setSlotType);
  const classes = styles();
  const translateText = useTranslator("attendanceModule", "timeWidget");
  const { isPending, mutate } = useUpdateEmployeeStatus();

  const handleClockInAnyway = (): void => {
    mutate(setSlotType(AttendanceSlotType.START));
    closeModal();
  };

  return (
    <>
      <Box component="div">
        <Box sx={classes.mainContainer}>
          <Box sx={classes.bodyContainer}>
            <Typography variant="body1" sx={classes.headerText}>
              {translateText(["clockInConfirmationDescription"])}
            </Typography>
            <Stack direction="column" gap="1rem">
              <Stack
                direction="row"
                justifyContent="flex-start"
                spacing={1}
                alignItems="center"
              >
                <Typography variant="body2" sx={classes.bodyText}>
                  {translateText(["duration"])}:
                </Typography>
                <BasicChip
                  label={leave.duration ? leave.duration : ""}
                  chipStyles={classes.bodyChipStyles}
                />
                <BasicChip
                  label={leave.date ? leave.date : ""}
                  chipStyles={classes.bodyChipStyles}
                />
              </Stack>
              <Stack
                direction="row"
                justifyContent="flex-start"
                spacing={1}
                alignItems="center"
              >
                <Typography variant="body2" sx={classes.bodyText}>
                  {translateText(["leaveType"])}:
                </Typography>
                <IconChip
                  icon={leave.leaveIcon as string}
                  label={leave.leaveName ? leave.leaveName : ""}
                  chipStyles={classes.bodyChipStyles}
                />
              </Stack>
            </Stack>
          </Box>
          <Stack spacing={2}>
            <Button onClick={handleClockInAnyway} aria-label={translateText(["clockInAnyway"])} isLoading={isPending} icon={<Icon name={IconName.CHECK_ICON} />} iconPosition="end">{translateText(["clockInAnyway"])}</Button>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default LeaveClockInModal;
