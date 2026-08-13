import { FC, useEffect, useState } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetMyPolicyLeaveRequestById } from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyCancelLeaveModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyCancelLeaveModal/PolicyCancelLeaveModal";
import PolicyEmployeeRequestModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyEmployeeRequestModal/PolicyEmployeeRequestModal";
import PolicyLeaveRequestSummary from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveRequestSummary/PolicyLeaveRequestSummary";
import {
  STATUS_POPUP_TYPES,
  SUMMARY_POPUP_TYPES
} from "~community/leave/constants/policyLeaveReviewConstants";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { PolicyLeavePopupType } from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const PolicyEmployeeLeaveStatusPopupController: FC = () => {
  const [popupType, setPopupType] = useState<PolicyLeavePopupType>(
    PolicyLeaveReviewModalEnums.NONE
  );

  const translateText = useTranslator("leaveModule", "myRequests");

  const { isEmployeeModalOpen, selectedRequestId, closeEmployeeModal } =
    usePolicyLeaveReviewStore((state) => ({
      isEmployeeModalOpen: state.isEmployeeModalOpen,
      selectedRequestId: state.selectedRequestId,
      closeEmployeeModal: state.closeEmployeeModal
    }));

  const { data: myLeaveRequest } =
    useGetMyPolicyLeaveRequestById(selectedRequestId);

  useEffect(() => {
    if (!isEmployeeModalOpen || !myLeaveRequest) return;
    setPopupType((currentPopupType) =>
      currentPopupType === PolicyLeaveReviewModalEnums.NONE
        ? (STATUS_POPUP_TYPES.find(
            (status) => status === myLeaveRequest.status
          ) ?? PolicyLeaveReviewModalEnums.NONE)
        : currentPopupType
    );
  }, [myLeaveRequest, isEmployeeModalOpen]);

  const handleCloseModal = (): void => {
    setPopupType(PolicyLeaveReviewModalEnums.NONE);
    closeEmployeeModal();
  };

  const getModalTitle = (): string => {
    switch (popupType) {
      case PolicyLeaveRequestStatus.APPROVED:
        return translateText(["myLeaveRequests", "leaveApproved"]);
      case PolicyLeaveRequestStatus.PENDING:
        return translateText(["myLeaveRequests", "approvalPending"]);
      case PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED:
        return translateText(["myLeaveRequests", "supervisorNudged"]);
      case PolicyLeaveRequestStatus.CANCELLED:
        return translateText(["myLeaveRequests", "cancelledLeaveStatus"]);
      case PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP:
        return translateText(["myLeaveRequests", "confirmCancellation"]);
      case PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY:
        return translateText(["myLeaveRequests", "leaveRequestCancelled"]);
      case PolicyLeaveRequestStatus.REVOKED:
        return translateText(["myLeaveRequests", "revokedLeaveStatus"]);
      case PolicyLeaveRequestStatus.DENIED:
        return translateText(["myLeaveRequests", "deniedLeaveStatus"]);
      default:
        return "";
    }
  };

  return (
    <>
      {isEmployeeModalOpen && popupType && myLeaveRequest && (
        <ModalController
          isModalOpen={isEmployeeModalOpen}
          handleCloseModal={handleCloseModal}
          modalTitle={getModalTitle()}
        >
          <>
            {popupType === PolicyLeaveRequestStatus.PENDING && (
              <PolicyEmployeeRequestModal
                request={myLeaveRequest}
                setPopupType={setPopupType}
              />
            )}

            {popupType === PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP && (
              <PolicyCancelLeaveModal
                request={myLeaveRequest}
                setPopupType={setPopupType}
              />
            )}

            {SUMMARY_POPUP_TYPES.includes(popupType) && (
              <PolicyLeaveRequestSummary
                request={myLeaveRequest}
                popupType={popupType}
                handleRequestStatusPopup={handleCloseModal}
              />
            )}
          </>
        </ModalController>
      )}
    </>
  );
};

export default PolicyEmployeeLeaveStatusPopupController;
