import { JSX, useMemo } from "react";

import { useRecordAttendance } from "~community/attendance/hooks/useRecordAttendance";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Button from "~community/common/components/atoms/Button/Button";
import {
  ButtonSizes,
  ButtonStyle,
  ToastType
} from "~community/common/enums/ComponentEnums";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
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

  const { setToastMessage } = useToast();
  const translateText = useTranslator("attendanceModule", "timeWidget");

  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const { recordAttendance, isPending } = useRecordAttendance(() => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["clockInErrorTitle"]),
      description: translateText(["clockInErrorDescription"])
    });
  });

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
      const slotType = setSlotType(AttendanceSlotType.START);
      recordAttendance(slotType);
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
    <Button
      buttonStyle={ButtonStyle.PRIMARY}
      size={ButtonSizes.SMALL}
      label={label}
      endIcon={IconName.TIMER_ICON}
      isFullWidth={false}
      onClick={onClick}
      ariaLabel={
        isClockedIn ? translateText(["clockIn"]) : translateText(["clockOut"])
      }
      isLoading={isPending}
      disabled={disabled}
      ariaDisabled={disabled}
      dataTestId={isClockedIn ? "clock-in-button" : "clock-out-button"}
    />
  );
};

export default ClockInButton;
