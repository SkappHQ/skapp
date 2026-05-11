import { JSX, useCallback, useMemo } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import Button from "~community/common/components/atoms/Button/Button";
import { appModes } from "~community/common/constants/configs";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { convertDateToUTC } from "~community/common/utils/dateTimeUtils";
import { useUpdateEmployeeStatusWithLocation } from "~enterprise/attendance/api/AttendanceApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

interface Props {
  disabled?: boolean;
}

// TODO: Replace with actual config API when available
const isGeoFencingEnabled = true;

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
  const { mutate: mutateWithLocation, isPending: isEpPending } =
    useUpdateEmployeeStatusWithLocation();

  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

  const isClockedIn = useMemo(() => {
    return (
      status === AttendanceSlotType.READY ||
      status === AttendanceSlotType.END ||
      status === AttendanceSlotType.LEAVE_DAY ||
      status === AttendanceSlotType.HOLIDAY ||
      status === AttendanceSlotType.NON_WORKING_DAY
    );
  }, [status]);

  const clockInWithLocation = useCallback(
    (slotType: AttendanceSlotType) => {
      navigator.geolocation.getCurrentPosition((position) => {
        mutateWithLocation({
          recordActionType: slotType,
          time: convertDateToUTC(new Date().toISOString()) as string,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    },
    [mutateWithLocation]
  );

  const onClick = () => {
    if (status === AttendanceSlotType.READY && !attendanceLeaveStatus.onLeave) {
      const slotType = setSlotType(AttendanceSlotType.START);

      if (isGeoFencingEnabled && isEnterprise) {
        clockInWithLocation(slotType);
      } else {
        mutate(slotType);
      }
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
      isLoading={isPending || isEpPending}
      disabled={disabled}
      ariaDisabled={disabled}
      dataTestId={isClockedIn ? "clock-in-button" : "clock-out-button"}
    />
  );
};

export default ClockInButton;
