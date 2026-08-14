import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetPolicyManagerLeaveRequestById } from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyLeaveDeclineModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveDeclineModal/PolicyLeaveDeclineModal";
import PolicyLeaveReviewModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveReviewModal/PolicyLeaveReviewModal";
import PolicyLeaveReviewResultModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveReviewResultModal/PolicyLeaveReviewResultModal";
import {
  MANAGER_REVIEW_MODAL_TITLE_KEYS,
  REVIEW_RESULT_POPUP_TYPES
} from "~community/leave/constants/policyLeaveReviewConstants";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import usePolicyLeaveStatusPopup from "~community/leave/hooks/usePolicyLeaveStatusPopup";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const PolicyLeaveReviewModalController: FC = () => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveModals"
  );

  const { isManagerModalOpen, selectedRequestId, closeManagerModal } =
    usePolicyLeaveStore(
      useShallow((state) => ({
        isManagerModalOpen: state.isManagerModalOpen,
        selectedRequestId: state.selectedRequestId,
        closeManagerModal: state.closeManagerModal
      }))
    );

  const { data: request } =
    useGetPolicyManagerLeaveRequestById(selectedRequestId);

  const { popupType, setPopupType, closePopup } = usePolicyLeaveStatusPopup({
    isOpen: isManagerModalOpen,
    requestStatus: request?.status,
    onClose: closeManagerModal
  });

  const titleKey = MANAGER_REVIEW_MODAL_TITLE_KEYS[popupType];

  const modalContent = (): ReactNode => {
    if (!request) {
      return null;
    }

    if (popupType === PolicyLeaveRequestStatus.PENDING) {
      return (
        <PolicyLeaveReviewModal request={request} setPopupType={setPopupType} />
      );
    }

    if (REVIEW_RESULT_POPUP_TYPES.includes(popupType)) {
      return (
        <PolicyLeaveReviewResultModal
          request={request}
          closeModal={closePopup}
          popupType={popupType}
        />
      );
    }

    if (popupType === PolicyLeaveReviewModalEnums.DECLINE) {
      return (
        <PolicyLeaveDeclineModal
          request={request}
          closeModal={closePopup}
          setPopupType={setPopupType}
        />
      );
    }

    return null;
  };

  return (
    <SmallModal
      isOpen={isManagerModalOpen && !!popupType}
      onClose={closePopup}
      modalHeader={titleKey ? translateText([titleKey]) : ""}
      content={modalContent()}
    />
  );
};

export default PolicyLeaveReviewModalController;
