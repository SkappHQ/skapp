import { FC, useEffect, useState } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetMyPolicyLeaveRequestById } from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyCancelLeaveModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyCancelLeaveModal/PolicyCancelLeaveModal";
import PolicyEmployeeRequestModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyEmployeeRequestModal/PolicyEmployeeRequestModal";
import PolicyLeaveRequestSummary from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveRequestSummary/PolicyLeaveRequestSummary";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const STATUS_POPUP_TYPES: PolicyLeaveRequestStatus[] = [
  PolicyLeaveRequestStatus.PENDING,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveRequestStatus.REVOKED
];

const SUMMARY_POPUP_TYPES: string[] = [
  PolicyLeaveRequestStatus.APPROVED,
  PolicyLeaveRequestStatus.DENIED,
  PolicyLeaveRequestStatus.REVOKED,
  PolicyLeaveRequestStatus.CANCELLED,
  PolicyLeaveReviewModalEnums.CANCELLED_SUMMARY,
  PolicyLeaveReviewModalEnums.SUPERVISOR_NUDGED
];

const PolicyEmployeeLeaveStatusPopupController: FC = () => {
  const [popupType, setPopupType] = useState<string>("");

  const translateText = useTranslator("leaveModule", "myRequests");

  const isEmployeeModalOpen = usePolicyLeaveReviewStore(
    (state) => state.isEmployeeModalOpen
  );
  const selectedRequestId = usePolicyLeaveReviewStore(
    (state) => state.selectedRequestId
  );
  const closeEmployeeModal = usePolicyLeaveReviewStore(
    (state) => state.closeEmployeeModal
  );

  const { data: request } = useGetMyPolicyLeaveRequestById(selectedRequestId);

  // Only seeds the popup once per opening. Cancelling and nudging both push their own
  // follow up popup, and reviewing the request writes a fresh object into the query
  // cache, so re-deriving from the status on every change would drop the user straight
  // back to the plain status popup.
  useEffect(() => {
    if (!isEmployeeModalOpen || !request) return;
    setPopupType((currentPopupType) =>
      currentPopupType === ""
        ? (STATUS_POPUP_TYPES.find((status) => status === request.status) ?? "")
        : currentPopupType
    );
  }, [request, isEmployeeModalOpen]);

  const handleCloseModal = (): void => {
    setPopupType("");
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
      {isEmployeeModalOpen && popupType && request && (
        <ModalController
          isModalOpen={isEmployeeModalOpen}
          handleCloseModal={handleCloseModal}
          modalTitle={getModalTitle()}
        >
          <>
            {popupType === PolicyLeaveRequestStatus.PENDING && (
              <PolicyEmployeeRequestModal
                request={request}
                setPopupType={setPopupType}
              />
            )}

            {popupType === PolicyLeaveReviewModalEnums.CANCEL_REQUEST_POPUP && (
              <PolicyCancelLeaveModal
                request={request}
                setPopupType={setPopupType}
              />
            )}

            {SUMMARY_POPUP_TYPES.includes(popupType) && (
              <PolicyLeaveRequestSummary
                request={request}
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
