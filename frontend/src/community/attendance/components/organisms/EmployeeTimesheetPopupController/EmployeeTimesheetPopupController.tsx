import { Box } from "@mui/material";
import { JSX, useEffect, useState } from "react";

import AddEditTimeEntry from "~community/attendance/components/molecules/AttendanceModals/AddEditTimeEntry/AddEditTimeEntry";
import HolidayEntryConfirmation from "~community/attendance/components/molecules/AttendanceModals/HolidayEntryConfirmation/HolidayEntryConfirmation";
import LeaveEntryConfirmation from "~community/attendance/components/molecules/AttendanceModals/LeaveEntryConfirmation/LeaveEntryConfirmation";
import OngoingTimeEntry from "~community/attendance/components/molecules/AttendanceModals/OngoingTimeEntry/OngoingTimeEntry";
import TimeEntryExists from "~community/attendance/components/molecules/AttendanceModals/TimeEntryExists/TimeEntryExists";
import TimeEntryRequestExists from "~community/attendance/components/molecules/AttendanceModals/TimeEntryRequestExists/TimeEntryRequestExists";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";

const EmployeeTimesheetPopupController = (): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const {
    isEmployeeTimesheetModalOpen,
    employeeTimesheetModalType,
    setIsEmployeeTimesheetModalOpen,
    setCurrentAddTimeChanges
  } = useAttendanceStore((state) => state);

  const [fromDateTime, setFromDateTime] = useState<string>("");
  const [toDateTime, setToDateTime] = useState<string>("");

  const getModalTitle = (): string => {
    switch (employeeTimesheetModalType) {
      case EmployeeTimesheetModalTypes.ADD_TIME_ENTRY:
        return translateText(["addEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY:
        return translateText(["entryConfirmationModalTitle"]);
      case EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS:
        return translateText(["entryExistModalTitle"]);
      case EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY:
        return translateText(["addEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY:
        return translateText(["editEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY:
        return translateText(["editEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE:
        return translateText(["addEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS:
        return translateText(["requestExistModalTitle"]);
      case EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY:
        return translateText(["entryConfirmationModalTitle"]);
      case EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY:
        return translateText(["ongoingEntryModalTitle"]);
      case EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS_BY_EDIT:
        return translateText(["requestExistModalTitle"]);
      case EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY_BY_EDIT:
        return translateText(["ongoingEntryModalTitle"]);
      default:
        return "";
    }
  };

  const handelCloseModal = (): void => {
    setIsEmployeeTimesheetModalOpen(false);
  };

  useEffect(() => {
    if (!isEmployeeTimesheetModalOpen) {
      setCurrentAddTimeChanges(undefined);
    }
  }, [isEmployeeTimesheetModalOpen, setCurrentAddTimeChanges]);

  return (
    <ModalController
      isModalOpen={isEmployeeTimesheetModalOpen}
      handleCloseModal={handelCloseModal}
      modalTitle={getModalTitle()}
      role="dialog"
    >
      <Box>
        {(employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ADD_TIME_ENTRY ||
          employeeTimesheetModalType ===
            EmployeeTimesheetModalTypes.ADD_LEAVE_TIME_ENTRY ||
          employeeTimesheetModalType ===
            EmployeeTimesheetModalTypes.EDIT_LEAVE_TIME_ENTRY ||
          employeeTimesheetModalType ===
            EmployeeTimesheetModalTypes.EDIT_AVAILABLE_TIME_ENTRY ||
          employeeTimesheetModalType ===
            EmployeeTimesheetModalTypes.ADD_TIME_ENTRY_BY_TABLE) && (
          <AddEditTimeEntry
            setFromDateTime={setFromDateTime}
            setToDateTime={setToDateTime}
          />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.CONFIRM_TIME_ENTRY && (
          <LeaveEntryConfirmation
            fromDateTime={fromDateTime}
            toDateTime={toDateTime}
          />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.TIME_ENTRY_EXISTS && (
          <TimeEntryExists
            fromDateTime={fromDateTime}
            toDateTime={toDateTime}
          />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS && (
          <TimeEntryRequestExists isEdit={false} />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.CONFIRM_HOLIDAY_TIME_ENTRY && (
          <HolidayEntryConfirmation
            fromDateTime={fromDateTime}
            toDateTime={toDateTime}
          />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY && (
          <OngoingTimeEntry isEdit={false} />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.TIME_REQUEST_EXISTS_BY_EDIT && (
          <TimeEntryRequestExists isEdit={true} />
        )}
        {employeeTimesheetModalType ===
          EmployeeTimesheetModalTypes.ONGOING_TIME_ENTRY_BY_EDIT && (
          <OngoingTimeEntry isEdit={true} />
        )}
      </Box>
    </ModalController>
  );
};

export default EmployeeTimesheetPopupController;
