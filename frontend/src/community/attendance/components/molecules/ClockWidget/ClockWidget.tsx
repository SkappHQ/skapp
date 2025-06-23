import { Stack } from "@mui/material";
import { type NextRouter, useRouter } from "next/router";
import { JSX, useEffect, useMemo } from "react";

import {
  useGetEmployeeLeaveStatus,
  useGetEmployeeStatus
} from "~community/attendance/api/AttendanceApi";
import { useGetTodaysTimeRequestAvailability } from "~community/attendance/api/AttendanceEmployeeApi";
import ClockInButton from "~community/attendance/components/molecules/ClockInButton/ClockInButton";
import Timer from "~community/attendance/components/molecules/Timer/Timer";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";

import styles from "./styles";

const ClockWidget = (): JSX.Element => {
  const translateAria = useTranslator("attendanceAria", "timeWidget");

  const router: NextRouter = useRouter();
  const { attendanceParams } = useAttendanceStore((state) => state);
  const status = attendanceParams.slotType;
  const classes = styles();

  const { refetch: getEmployeeStatusRefetch } = useGetEmployeeStatus();
  const { data: timeConfigData } = useDefaultCapacity();
  const { refetch: refetchLeaveStatusData } = useGetEmployeeLeaveStatus(
    timeConfigData?.[0] as DefaultDayCapacityType
  );

  const {
    data: isTimeRequestAvailableToday,
    isLoading: isAvailabilityLoading
  } = useGetTodaysTimeRequestAvailability();

  // NOTE: The Tooltip component is commented out because to address the accessibility issue,
  // "Ensure interactive controls are not nested"
  // This component will be redesigned in the future.
  // const translateText = useTranslator("attendanceModule", "timeWidget");

  const isDisabled = useMemo(
    () =>
      status === AttendanceSlotType.END ||
      status === AttendanceSlotType.HOLIDAY ||
      status === AttendanceSlotType.NON_WORKING_DAY ||
      status === AttendanceSlotType.LEAVE_DAY ||
      isTimeRequestAvailableToday ||
      isAvailabilityLoading,
    [status, isTimeRequestAvailableToday, isAvailabilityLoading]
  );

  // NOTE: The Tooltip component is commented out because to address the accessibility issue,
  // "Ensure interactive controls are not nested"
  // This component will be redesigned in the future.
  // const title = useMemo(() => {
  //   if (!isDisabled) return "";
  //   switch (status) {
  //     case AttendanceSlotType.END:
  //       return translateText(["youHaveAlreadyLoggedTime"]);
  //     case AttendanceSlotType.HOLIDAY:
  //       return translateText(["notAllowedToClockInOnHolidaysTooltip"]);
  //     case AttendanceSlotType.NON_WORKING_DAY:
  //       return translateText(["notAllowedToClockInOnNonWorkingDaysTooltip"]);
  //     case AttendanceSlotType.LEAVE_DAY:
  //       return translateText(["notAllowedToClockInOnLeaveDaysTooltip"]);
  //     default:
  //       return "";
  //   }
  // }, [isDisabled, status, translateText]);

  useEffect(() => {
    void getEmployeeStatusRefetch();
    void refetchLeaveStatusData();
  }, [router, getEmployeeStatusRefetch, refetchLeaveStatusData]);

  return (
    // NOTE: The Tooltip component is commented out because to address the accessibility issue,
    // "Ensure interactive controls are not nested"
    // This component will be redesigned in the future.
    // <Tooltip
    //   id="play-button"
    //   title={title}
    //   placement={TooltipPlacement.BOTTOM}
    //   spanStyles={{
    //     borderRadius: "3.3125rem"
    //   }}
    // >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.5}
      component="div"
      sx={classes.timerContainer(isDisabled)}
      aria-label={translateAria(["widget"])}
    >
      <Timer disabled={isDisabled} />
      <ClockInButton disabled={isDisabled} />
    </Stack>
    // </Tooltip>
  );
};

export default ClockWidget;
