import { JSX, useEffect, useState } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";
import EmployeeCancelLeaveStatusPopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeeCancelLeaveStatusPopup/EmployeeCancelLeaveStatusPopup";
import EmployeeConfirmCancelLeavePopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeeConfirmCancelLeavePopup/EmployeeConfirmCancelLeavePopup";
import EmployeeLeaveApprovedStatusPopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeeLeaveApprovedStatusPopup/EmployeeLeaveApprovedStatusPopup";
import EmployeeLeaveRequestCancelledPopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeeLeaveRequestCancelledPopup/EmployeeLeaveRequestCancelledPopup";
import EmployeeNudgeSupervisorPopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeeNudgeSupervisorPopup/EmployeeNudgeSupervisorPopup";
import EmployeePendingLeaveStatusPopup from "~community/leave/components/molecules/EmployeeLeaveStatusPopups/EmployeePendingLeaveStatusPopup/EmployeePendingLeaveStatusPopup";
import { useLeaveStore } from "~community/leave/store/store";
import { EmployeeLeaveStatusPopupTypes } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { LeaveStatusTypes } from "~community/leave/types/LeaveTypes";

import EmployeeLeaveDeniedStatusPopup from "../../molecules/EmployeeLeaveStatusPopups/EmployeeLeaveDeniedStatusPopup/EmployeeLeaveDeniedStatusPopup";
import EmployeeLeaveRevokedStatusPopup from "../../molecules/EmployeeLeaveStatusPopups/EmployeeLeaveRevokedStatusPopup/EmployeeLeaveRevokedStatusPopup";

const LeaveStatusPopupController = (): JSX.Element => {
  const [popupType, setPopupType] = useState<LeaveStatusTypes | string>("");
  const {
    removeEmployeeLeaveRequestData,
    employeeLeaveRequestData,
    isEmployeeModalOpen,
    setIsEmployeeModal,
    removeNewLeaveId
  } = useLeaveStore((state) => ({
    removeEmployeeLeaveRequestData: state.removeEmployeeLeaveRequestData,
    employeeLeaveRequestData: state.employeeLeaveRequestData,
    isEmployeeModalOpen: state.isEmployeeModalOpen,
    setIsEmployeeModal: state.setIsEmployeeModal,
    removeNewLeaveId: state.removeNewLeaveId
  }));

  const translateText = useTranslator("leaveModule", "myRequests");

  const handlePopupType = (status: LeaveStatusTypes): void => {
    switch (status) {
      case LeaveStatusTypes.PENDING:
      case LeaveStatusTypes.DENIED:
      case LeaveStatusTypes.APPROVED:
      case LeaveStatusTypes.CANCELLED:
      case LeaveStatusTypes.REVOKED:
      case LeaveStatusTypes.SUPERVISOR_NUDGED:
        setPopupType(status);
        break;
      default:
        setPopupType("");
    }
  };

  useEffect(() => {
    handlePopupType(employeeLeaveRequestData.status as LeaveStatusTypes);
  }, [employeeLeaveRequestData, isEmployeeModalOpen]);

  const handleCloseModal = () => {
    setIsEmployeeModal(false);
    setPopupType("");
    removeNewLeaveId();
    removeEmployeeLeaveRequestData();
  };

  const getModalTitle = (): string => {
    switch (popupType) {
      case LeaveStatusTypes.APPROVED:
        return translateText(["myLeaveRequests", "leaveApproved"]);
      case LeaveStatusTypes.PENDING:
        return translateText(["myLeaveRequests", "approvalPending"]);
      case LeaveStatusTypes.SUPERVISOR_NUDGED:
        return translateText(["myLeaveRequests", "supervisorNudged"]);
      case LeaveStatusTypes.CANCELLED:
        return translateText(["myLeaveRequests", "cancelledLeaveStatus"]);
      case EmployeeLeaveStatusPopupTypes.CANCEL_REQUEST_POPUP:
        return translateText(["myLeaveRequests", "confirmCancellation"]);
      case EmployeeLeaveStatusPopupTypes.CANCELLED_SUMMARY:
        return translateText(["myLeaveRequests", "leaveRequestCancelled"]);
      case LeaveStatusTypes.REVOKED:
        return translateText(["myLeaveRequests", "revokedLeaveStatus"]);
      case LeaveStatusTypes.DENIED:
        return translateText(["myLeaveRequests", "deniedLeaveStatus"]);
      default:
        return "";
    }
  };

  return (
    <>
      {isEmployeeModalOpen && popupType && (
        <ModalController
          isModalOpen={isEmployeeModalOpen}
          handleCloseModal={handleCloseModal}
          modalTitle={getModalTitle()}
        >
          <>
            {popupType === LeaveStatusTypes.PENDING && (
              <EmployeePendingLeaveStatusPopup setPopupType={setPopupType} />
            )}

            {popupType === LeaveStatusTypes.SUPERVISOR_NUDGED && (
              <EmployeeNudgeSupervisorPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}

            {popupType === LeaveStatusTypes.CANCELLED && (
              <EmployeeCancelLeaveStatusPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}

            {popupType ===
              EmployeeLeaveStatusPopupTypes.CANCEL_REQUEST_POPUP && (
              <EmployeeConfirmCancelLeavePopup setPopupType={setPopupType} />
            )}

            {popupType === EmployeeLeaveStatusPopupTypes.CANCELLED_SUMMARY && (
              <EmployeeLeaveRequestCancelledPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}

            {popupType === LeaveStatusTypes.APPROVED && (
              <EmployeeLeaveApprovedStatusPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}

            {popupType === LeaveStatusTypes.REVOKED && (
              <EmployeeLeaveRevokedStatusPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}

            {popupType === LeaveStatusTypes.DENIED && (
              <EmployeeLeaveDeniedStatusPopup
                handleRequestStatusPopup={handleCloseModal}
              />
            )}
          </>
        </ModalController>
      )}
    </>
  );
};

export default LeaveStatusPopupController;
