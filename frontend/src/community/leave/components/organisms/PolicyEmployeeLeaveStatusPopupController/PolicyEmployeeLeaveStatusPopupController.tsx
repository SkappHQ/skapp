import { FC } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetMyPolicyLeaveRequestById } from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyCancelLeaveModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyCancelLeaveModal/PolicyCancelLeaveModal";
import PolicyEmployeeRequestModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyEmployeeRequestModal/PolicyEmployeeRequestModal";
import PolicyLeaveRequestSummary from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveRequestSummary/PolicyLeaveRequestSummary";
import {
  EMPLOYEE_STATUS_MODAL_TITLE_KEYS,
  SUMMARY_POPUP_TYPES
} from "~community/leave/constants/policyLeaveReviewConstants";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import usePolicyLeaveStatusPopup from "~community/leave/hooks/usePolicyLeaveStatusPopup";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const PolicyEmployeeLeaveStatusPopupController: FC = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "myLeaveRequests"
  );

  const { isEmployeeModalOpen, selectedRequestId, closeEmployeeModal } =
    usePolicyLeaveStore((state) => ({
      isEmployeeModalOpen: state.isEmployeeModalOpen,
      selectedRequestId: state.selectedRequestId,
      closeEmployeeModal: state.closeEmployeeModal
    }));

  const { data: myLeaveRequest } =
    useGetMyPolicyLeaveRequestById(selectedRequestId);

  const { popupType, setPopupType, closePopup } = usePolicyLeaveStatusPopup({
    isOpen: isEmployeeModalOpen,
    requestStatus: myLeaveRequest?.status,
    onClose: closeEmployeeModal
  });

  if (!isEmployeeModalOpen || !popupType || !myLeaveRequest) {
    return null;
  }

  const titleKey = EMPLOYEE_STATUS_MODAL_TITLE_KEYS[popupType];

  return (
    <ModalController
      isModalOpen={isEmployeeModalOpen}
      handleCloseModal={closePopup}
      modalTitle={titleKey ? translateText([titleKey]) : ""}
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
            handleRequestStatusPopup={closePopup}
          />
        )}
      </>
    </ModalController>
  );
};

export default PolicyEmployeeLeaveStatusPopupController;
