import { Stack } from "@mui/material";
import { type NextRouter, useRouter } from "next/router";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

import {
  useGetEmployeeLeaveStatus,
  useGetEmployeeStatus
} from "~community/attendance/api/AttendanceApi";
import { useGetTodaysTimeRequestAvailability } from "~community/attendance/api/AttendanceEmployeeApi";
import ClockInButton from "~community/attendance/components/molecules/ClockInButton/ClockInButton";
import Timer from "~community/attendance/components/molecules/Timer/Timer";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
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
  const [hasHoveredAfterEnd, setHasHoveredAfterEnd] = useState(false);
  const {
    data: isTimeRequestAvailableToday,
    isLoading: isAvailabilityLoading
  } = useGetTodaysTimeRequestAvailability();

  const translateText = useTranslator("attendanceModule", "timeWidget");

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

  const title = useMemo(() => {
    if (!isDisabled) return "";
    switch (status) {
      case hasHoveredAfterEnd && AttendanceSlotType.END:
        return translateText(["youHaveAlreadyLoggedTime"]);
      case AttendanceSlotType.HOLIDAY:
        return translateText(["notAllowedToClockInOnHolidaysTooltip"]);
      case AttendanceSlotType.NON_WORKING_DAY:
        return translateText(["notAllowedToClockInOnNonWorkingDaysTooltip"]);
      case AttendanceSlotType.LEAVE_DAY:
        return translateText(["notAllowedToClockInOnLeaveDaysTooltip"]);
      default:
        return "";
    }
  }, [isDisabled, status, translateText, hasHoveredAfterEnd]);

  const showTimer = useMemo(
    () =>
      status === AttendanceSlotType.START ||
      status === AttendanceSlotType.RESUME ||
      status === AttendanceSlotType.PAUSE,
    [status]
  );

  useEffect(() => {
    if (status !== AttendanceSlotType.END) {
      setHasHoveredAfterEnd(false);
    }
  }, [status]);

  // Handle mouse enter to track hover
  const handleMouseEnter = useCallback(() => {
    if (status === AttendanceSlotType.END) {
      setHasHoveredAfterEnd(true);
    }
  }, [status]);
  useEffect(() => {
    void getEmployeeStatusRefetch();
    void refetchLeaveStatusData();
  }, [router, getEmployeeStatusRefetch, refetchLeaveStatusData]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1.5}
      component="div"
      sx={classes.timerContainer(isDisabled)}
      aria-label={translateAria(["widget"])}
      onMouseEnter={handleMouseEnter}
    >
      {showTimer && <Timer disabled={isDisabled} />}
      <Tooltip title={title} placement={TooltipPlacement.BOTTOM}>
        <span>
          <ClockInButton disabled={isDisabled} />
        </span>
      </Tooltip>
    </Stack>
  );
};

export default ClockWidget;
