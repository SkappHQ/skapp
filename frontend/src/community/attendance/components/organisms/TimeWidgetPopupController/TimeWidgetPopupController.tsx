import { SmallModal } from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useState } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import AutoClockOutMidnightModal from "~community/attendance/components/molecules/AttendanceModals/AutoClockoutMidnightModal/AutoClockOutMidnightModal";
import ClockOutModal from "~community/attendance/components/molecules/AttendanceModals/ClockOutModal/ClockOutModal";
import LeaveClockInModal from "~community/attendance/components/molecules/AttendanceModals/LeaveClockInModal/LeaveClockInModal";
import PreMidnightClockOutAlertModal from "~community/attendance/components/molecules/AttendanceModals/PreMidnightClockOutAlertModal/PreMidnightClockOutAlertModal";
import {
  AUTO_CLOCK_OUT_TIME,
  PRE_MIDNIGHT_ALERT_TIME
} from "~community/attendance/constants/constants";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  AttendancePopupTypes,
  AttendanceSlotType
} from "~community/attendance/types/attendanceTypes";
import { useBusinessZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { millisUntilTodayAt } from "~community/common/utils/dateTimeUtils";

const TimeWidgetPopupController = (): JSX.Element => {
  const [popupType, setPopupType] = useState<AttendancePopupTypes>(
    AttendancePopupTypes.CLOCK_OUT
  );
  const {
    isAttendanceModalOpen,
    setIsAttendanceModalOpen,
    attendanceParams,
    setSlotType,
    attendanceLeaveStatus,
    isPreMidnightClockOutAlertOpen,
    isAutoClockOutMidnightModalOpen,
    setIsPreMidnightClockOutAlertOpen,
    setIsAutoClockOutMidnightModalOpen
  } = useAttendanceStore((state) => state);
  const businessZone = useBusinessZone();

  const { mutateAsync: updateEmployeeStatus } = useUpdateEmployeeStatus();

  const translateText = useTranslator("attendanceModule", "timeWidget");

  const { slotType: status } = attendanceParams;
  const { onLeave: isLeave } = attendanceLeaveStatus;

  const handleCloseAttendanceModal = (): void => {
    setIsAttendanceModalOpen(false);
  };

  const handleClosePreMidnightModal = (): void => {
    setIsPreMidnightClockOutAlertOpen(false);
  };

  const handleCloseMidnightModal = (): void => {
    setIsAutoClockOutMidnightModalOpen(false);
  };

  useEffect(() => {
    if (status === AttendanceSlotType.READY && isLeave) {
      setPopupType(AttendancePopupTypes.CLOCK_IN);
    } else {
      setPopupType(AttendancePopupTypes.CLOCK_OUT);
    }
  }, [status, isLeave]);

  useEffect(() => {
    const timeUntilAlert = millisUntilTodayAt(
      PRE_MIDNIGHT_ALERT_TIME,
      businessZone
    );
    if (timeUntilAlert === undefined) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (
        status === AttendanceSlotType.START ||
        status === AttendanceSlotType.RESUME
      ) {
        setIsPreMidnightClockOutAlertOpen(true);
      }
    }, timeUntilAlert);

    return () => clearTimeout(timeoutId);
  }, [status, businessZone]);

  useEffect(() => {
    const timeUntilAlert = millisUntilTodayAt(
      AUTO_CLOCK_OUT_TIME,
      businessZone
    );
    if (timeUntilAlert === undefined) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (
        status === AttendanceSlotType.START ||
        status === AttendanceSlotType.RESUME
      ) {
        await updateEmployeeStatus(setSlotType(AttendanceSlotType.END));
        setIsAutoClockOutMidnightModalOpen(true);
      }
    }, timeUntilAlert);

    return () => clearTimeout(timeoutId);
  }, [status, businessZone]);

  const getModalTitle = (): string => {
    if (isAttendanceModalOpen && popupType === AttendancePopupTypes.CLOCK_OUT) {
      return translateText(["clockOutConfirmation"]);
    }
    if (isAttendanceModalOpen && popupType === AttendancePopupTypes.CLOCK_IN) {
      return translateText(["clockInConfirmation"]);
    }
    if (isPreMidnightClockOutAlertOpen) {
      return translateText(["clockOutAlert"]);
    }
    if (isAutoClockOutMidnightModalOpen) {
      return translateText(["clockedOut"]);
    }
    return "";
  };

  const handleCloseModal = (): void => {
    if (isAttendanceModalOpen) {
      handleCloseAttendanceModal();
    } else if (isPreMidnightClockOutAlertOpen) {
      handleClosePreMidnightModal();
    } else if (isAutoClockOutMidnightModalOpen) {
      handleCloseMidnightModal();
    }
  };

  const modalContent = (): JSX.Element => (
    <>
      {isAttendanceModalOpen &&
        popupType === AttendancePopupTypes.CLOCK_OUT && (
          <ClockOutModal closeModal={handleCloseAttendanceModal} />
        )}

      {isAttendanceModalOpen && popupType === AttendancePopupTypes.CLOCK_IN && (
        <LeaveClockInModal closeModal={handleCloseAttendanceModal} />
      )}

      {isPreMidnightClockOutAlertOpen && (
        <PreMidnightClockOutAlertModal
          closeModal={handleClosePreMidnightModal}
        />
      )}

      {isAutoClockOutMidnightModalOpen && (
        <AutoClockOutMidnightModal closeModal={handleCloseMidnightModal} />
      )}
    </>
  );

  return (
    <SmallModal
      isOpen={
        isAttendanceModalOpen ||
        isPreMidnightClockOutAlertOpen ||
        isAutoClockOutMidnightModalOpen
      }
      onClose={handleCloseModal}
      modalHeader={getModalTitle()}
      content={modalContent()}
    />
  );
};

export default TimeWidgetPopupController;
