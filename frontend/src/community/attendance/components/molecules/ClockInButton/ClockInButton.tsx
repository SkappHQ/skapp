import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, useMemo } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Icon from "~community/common/components/atoms/Icon/Icon";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  disabled?: boolean;
}

const ClockInButton = ({ disabled }: Props): JSX.Element => {
  const {
    attendanceParams,
    attendanceLeaveStatus,
    setSlotType,
    setIsAttendanceModalOpen
  } = useAttendanceStore((state) => state);

  const status = attendanceParams.slotType;

  const translateText = useTranslator("attendanceModule", "timeWidget");

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const { isPending, mutate } = useUpdateEmployeeStatus();

  const isClockedIn = useMemo(() => {
    return (
      status === AttendanceSlotType.READY ||
      status === AttendanceSlotType.END ||
      status === AttendanceSlotType.LEAVE_DAY ||
      status === AttendanceSlotType.HOLIDAY ||
      status === AttendanceSlotType.NON_WORKING_DAY
    );
  }, [status]);

  const onClick = () => {
    if (status === AttendanceSlotType.READY && !attendanceLeaveStatus.onLeave) {
      mutate(setSlotType(AttendanceSlotType.START));
    } else {
      setIsAttendanceModalOpen(true);
    }
  };

  const label = useMemo(() => {
    if (isBelow600) {
      return "";
    }

    return isClockedIn
      ? translateText(["clockIn"])
      : translateText(["clockOut"]);
  }, [isBelow600, isClockedIn, translateText]);

  return (
    <ButtonV2
      variant={"primary"}
      size={"sm"}
      onClick={onClick}
      aria-label={
        isClockedIn ? translateText(["clockIn"]) : translateText(["clockOut"])
      }
      isLoading={isPending}
      disabled={disabled}
      aria-disabled={disabled}
      data-testid={isClockedIn ? "clock-in-button" : "clock-out-button"}
      icon={<Icon name={IconName.TIMER_ICON} />}
      iconPosition="end"
    >
      {label}
    </ButtonV2>
  );
};

export default ClockInButton;
