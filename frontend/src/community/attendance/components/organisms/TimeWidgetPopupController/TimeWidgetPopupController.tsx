import { SmallModal } from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useState } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import AutoClockOutMidnightModal from "~community/attendance/components/molecules/AttendanceModals/AutoClockoutMidnightModal/AutoClockOutMidnightModal";
import ClockOutModal from "~community/attendance/components/molecules/AttendanceModals/ClockOutModal/ClockOutModal";
import LeaveClockInModal from "~community/attendance/components/molecules/AttendanceModals/LeaveClockInModal/LeaveClockInModal";
import PreMidnightClockOutAlertModal from "~community/attendance/components/molecules/AttendanceModals/PreMidnightClockOutAlertModal/PreMidnightClockOutAlertModal";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  AttendancePopupTypes,
  AttendanceSlotType
} from "~community/attendance/types/attendanceTypes";
import { useTranslator } from "~community/common/hooks/useTranslator";

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
    const firstTarget = new Date();
    firstTarget.setHours(23, 50, 0, 0);

    const now = new Date();
    let timeUntilAlert = 0;
    if (now <= firstTarget) {
      timeUntilAlert = firstTarget.getTime() - now.getTime();
    } else {
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
  }, [status]);

  useEffect(() => {
    const secondTarget = new Date();
    secondTarget.setHours(23, 59, 58, 0);

    const now = new Date();
    let timeUntilAlert = 0;
    if (now <= secondTarget) {
      timeUntilAlert = secondTarget.getTime() - now.getTime();
    } else {
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
  }, [status]);

  const getModalTitle = (): string => {
    if (isAttendanceModalOpen && popupType === AttendancePopupTypes.CLOCK_OUT) {
      return translateText(["clockOutConfirmation"]);
    }
    if (isAttendanceModalOpen && popupType === AttendancePopupTypes.CLOCK_IN) {
      return translateText(["clockInConfirmation"]);
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
