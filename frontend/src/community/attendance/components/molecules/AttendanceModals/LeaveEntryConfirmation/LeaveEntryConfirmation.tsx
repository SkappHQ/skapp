import { Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import {
  DAY_MONTH_YEAR_FORMAT,
  durationSelector
} from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import useAddEntry from "~community/attendance/hooks/useAddEntry";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";

import styles from "./styles";

interface Props {
  fromDateTime: string;
  toDateTime: string;
}

const LeaveEntryConfirmation = ({ fromDateTime, toDateTime }: Props) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const classes = styles(theme);
  const {
    timeAvailabilityForPeriod,
    setIsEmployeeTimesheetModalOpen,
    setEmployeeTimesheetModalType
  } = useAttendanceStore((state) => state);

  const { confirmManualTimeEntry } = useAddEntry();

  const handleSubmit = () => {
    confirmManualTimeEntry(fromDateTime, toDateTime);
  };

  return (
    <>
      <Typography variant="body1" sx={{ py: "1rem" }}>
        {translateText(["confirmationModalDes"])}
      </Typography>
      <Stack sx={{ ...classes.leaveDurationStack, pb: "1rem" }}>
        <Typography variant="body1">
          {translateText(["durationLabel"])}
        </Typography>
        <BasicChip
          label={
            durationSelector[
              timeAvailabilityForPeriod?.leaveRequest?.[0]?.leaveState
            ]
          }
          chipStyles={classes.leaveStateChip}
        />
        <BasicChip
          label={convertDateToFormat(
            new Date(timeAvailabilityForPeriod?.date),
            DAY_MONTH_YEAR_FORMAT
          )}
          chipStyles={classes.leaveDateChip}
        />
      </Stack>
      <Stack sx={classes.leaveDurationStack}>
        <Typography variant="body1">
          {translateText(["leaveTypeLabel"])}
        </Typography>
        <IconChip
          label={timeAvailabilityForPeriod?.leaveRequest?.[0]?.leaveType?.name}
          icon={timeAvailabilityForPeriod?.leaveRequest?.[0]?.leaveType?.emoji}
          chipStyles={classes.leaveStateChip}
          isTruncated={false}
        />
      </Stack>
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"primary"}
          onClick={handleSubmit}
          icon={<Icon name={IconName.CHECK_ICON} />}
          iconPosition="end"
        >
          {translateText(["confirmBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant={"tertiary"}
          onClick={() => {
            setIsEmployeeTimesheetModalOpen(true);
            setEmployeeTimesheetModalType(
              EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
            );
          }}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnTxt"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default LeaveEntryConfirmation;
