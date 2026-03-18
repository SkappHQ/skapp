import { Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import { useAddManualTimeEntry } from "~community/attendance/api/AttendanceEmployeeApi";
import { holidayDurationSelector } from "~community/attendance/constants/constants";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  convertToUtc,
  getCurrentTimeZone
} from "~community/attendance/utils/TimeUtils";
import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToFormat } from "~community/common/utils/dateTimeUtils";

interface Props {
  fromDateTime: string;
  toDateTime: string;
}

const HolidayEntryConfirmation = ({ fromDateTime, toDateTime }: Props) => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setToastMessage } = useToast();
  const {
    timeAvailabilityForPeriod,
    setIsEmployeeTimesheetModalOpen,
    setEmployeeTimesheetModalType
  } = useAttendanceStore((state) => state);

  const onSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntrySuccessTitle"]),
      description: translateText(["addTimeEntrySuccessDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onError = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntryErrorTitle"]),
      description: translateText(["addTimeEntryErrorDes"]),
      toastType: ToastType.ERROR
    });
  };

  const { mutate: manualEntryMutate } = useAddManualTimeEntry(
    onSuccess,
    onError
  );

  const handleSubmit = () => {
    manualEntryMutate({
      startTime: convertToUtc(fromDateTime) as string,
      endTime: convertToUtc(toDateTime) as string,
      zoneId: getCurrentTimeZone()
    });
    setIsEmployeeTimesheetModalOpen(false);
  };

  return (
    <>
      <Typography variant="body1" sx={{ py: "1rem" }}>
        {translateText(["holidayConfirmationModalDes"])}
      </Typography>
      <Stack
        display={"flex"}
        direction={"row"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        gap={"1rem"}
        sx={{ pb: "1rem" }}
      >
        <Typography variant="body1">
          {translateText(["durationLabel"])}
        </Typography>
        <BasicChip
          label={
            holidayDurationSelector[
              timeAvailabilityForPeriod?.holiday?.[0]?.holidayDuration
            ]
          }
          chipStyles={{ background: theme.palette.grey[100] }}
        />
        <BasicChip
          label={convertDateToFormat(
            new Date(timeAvailabilityForPeriod?.date),
            "dd LLL yyyy"
          )}
          chipStyles={{
            background: theme.palette.grey[100],
            "& .MuiChip-label": {
              maxWidth: undefined
            }
          }}
        />
      </Stack>
      <Stack
        display={"flex"}
        direction={"row"}
        justifyContent={"flex-start"}
        alignItems={"center"}
        gap={"1rem"}
      >
        <Typography variant="body1">
          {translateText(["holidayTypeLabel"])}
        </Typography>
        <IconChip
          label={"Holiday"}
          icon={"1f3d6-fe0f"}
          chipStyles={{
            backgroundColor: theme.palette.grey[100]
          }}
          isTruncated={false}
        />
      </Stack>
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
    </>
  );
};

export default HolidayEntryConfirmation;
