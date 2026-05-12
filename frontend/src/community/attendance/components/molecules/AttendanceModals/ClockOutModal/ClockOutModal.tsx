import { Box, Stack, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import {
  calculateWorkedDuration,
  calculateWorkedDurationInHoursAndMinutes
} from "~community/attendance/utils/CalculateWorkedDuration";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { appModes } from "~community/common/constants/configs";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToUTC } from "~community/common/utils/dateTimeUtils";
import { useUpdateEmployeeStatusWithLocation } from "~enterprise/attendance/api/AttendanceApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

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
  const { mutate: mutateWithLocation, isPending: isEpPending } =
    useUpdateEmployeeStatusWithLocation();

  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

  const { data: attendanceConfig } = useGetAttendanceConfiguration();
  const isGeoFencingEnabled = attendanceConfig?.isGeoFencingEnabled ?? false;

  const handleProceedHome = (): void => {
    const slotType = setSlotType(AttendanceSlotType.END);

    if (isGeoFencingEnabled && isEnterprise) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mutateWithLocation({
            recordActionType: slotType,
            time: convertDateToUTC(new Date().toISOString()) as string,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          mutateWithLocation({
            recordActionType: slotType,
            time: convertDateToUTC(new Date().toISOString()) as string,
            latitude: null,
            longitude: null
          });
        }
      );
    } else {
      mutate(slotType);
    }

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
              isLoading={isPending || isEpPending}
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
