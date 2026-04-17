import { useTheme } from "@mui/material";
import { type NextRouter, useRouter } from "next/router";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

import {
  useGetEmployeeLeaveStatus,
  useGetEmployeeStatus,
  useUpdateEmployeeStatus
} from "~community/attendance/api/AttendanceApi";
import { useGetTodaysTimeRequestAvailability } from "~community/attendance/api/AttendanceEmployeeApi";
import Timer from "~community/attendance/components/molecules/Timer/Timer";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { TooltipPlacement } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";

const ClockWidget = (): JSX.Element => {
  const theme = useTheme();
  const translateAria = useTranslator("attendanceAria", "timeWidget");

  const router: NextRouter = useRouter();
  const {
    attendanceParams,
    attendanceLeaveStatus,
    setSlotType,
    setIsAttendanceModalOpen
  } = useAttendanceStore((state) => state);
  const status = attendanceParams.slotType;

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

  const { mutate } = useUpdateEmployeeStatus();

  const translateText = useTranslator("attendanceModule", "timeWidget");

  const isDisabled = useMemo(
    () =>
      status === AttendanceSlotType.HOLIDAY ||
      status === AttendanceSlotType.NON_WORKING_DAY ||
      status === AttendanceSlotType.LEAVE_DAY ||
      status === AttendanceSlotType.END ||
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

  const handleMouseEnter = useCallback(() => {
    if (status === AttendanceSlotType.END) {
      setHasHoveredAfterEnd(true);
    }
  }, [status]);

  useEffect(() => {
    void getEmployeeStatusRefetch();
    void refetchLeaveStatusData();
  }, [router, getEmployeeStatusRefetch, refetchLeaveStatusData]);

  const handleClockIn = useCallback(() => {
    if (isDisabled) return;
    if (
      (status === AttendanceSlotType.READY ||
        status === AttendanceSlotType.END) &&
      !attendanceLeaveStatus.onLeave
    ) {
      mutate(setSlotType(AttendanceSlotType.START));
    } else {
      setIsAttendanceModalOpen(true);
    }
  }, [
    isDisabled,
    status,
    attendanceLeaveStatus.onLeave,
    mutate,
    setSlotType,
    setIsAttendanceModalOpen
  ]);

  if (showTimer) {
    return (
      <div
        className="flex flex-row items-center w-fit"
        aria-label={translateAria(["widget"])}
      >
        <Timer disabled={false} />
      </div>
    );
  }

  return (
    <Tooltip title={title} placement={TooltipPlacement.BOTTOM}>
      <span onMouseEnter={handleMouseEnter}>
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all${
            isDisabled
              ? " cursor-default opacity-50 grayscale border-secondary-accent bg-tertiary-background"
              : " cursor-pointer border-primary-accent bg-primary-background hover:opacity-85"
          }`}
          onClick={handleClockIn}
          disabled={isDisabled}
          aria-label={
            isDisabled ? translateAria(["widget"]) : translateText(["clockIn"])
          }
        >
          <Icon
            name={IconName.TIMER_ICON}
            width="1.25rem"
            height="1.25rem"
            fill={theme.palette.secondary.dark}
          />
        </button>
      </span>
    </Tooltip>
  );
};

export default ClockWidget;
