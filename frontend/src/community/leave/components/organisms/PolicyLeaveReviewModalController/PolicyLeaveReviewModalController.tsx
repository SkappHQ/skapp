import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetPolicyManagerLeaveRequestById } from "~community/leave/api/PolicyLeaveReviewApi";
import PolicyLeaveDeclineModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveDeclineModal/PolicyLeaveDeclineModal";
import PolicyLeaveReviewModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveReviewModal/PolicyLeaveReviewModal";
import PolicyLeaveReviewResultModal from "~community/leave/components/molecules/PolicyLeaveReviewModals/PolicyLeaveReviewResultModal/PolicyLeaveReviewResultModal";
import { PolicyLeaveReviewModalEnums } from "~community/leave/enums/PolicyLeaveReviewEnums";
import { usePolicyLeaveReviewStore } from "~community/leave/store/policyLeaveReviewStore";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const PolicyLeaveReviewModalController: FC = () => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveModals"
  );

  const isManagerModalOpen = usePolicyLeaveReviewStore(
    (state) => state.isManagerModalOpen
  );
  const selectedRequestId = usePolicyLeaveReviewStore(
    (state) => state.selectedRequestId
  );
  const closeManagerModal = usePolicyLeaveReviewStore(
    (state) => state.closeManagerModal
  );

  const [modalTitle, setModalTitle] = useState<string>("");
  const [popupType, setPopupType] = useState<string>("");

  const { data: request } =
    useGetPolicyManagerLeaveRequestById(selectedRequestId);

  const closeModel = (): void => {
    setPopupType("");
    closeManagerModal();
  };

  useEffect(() => {
    if (!request) return;
    if (request.status === PolicyLeaveRequestStatus.PENDING)
      return setPopupType(PolicyLeaveRequestStatus.PENDING);
    if (request.status === PolicyLeaveRequestStatus.DENIED)
      return setPopupType(PolicyLeaveRequestStatus.DENIED);
    if (request.status === PolicyLeaveRequestStatus.APPROVED)
      return setPopupType(PolicyLeaveRequestStatus.APPROVED);
    if (request.status === PolicyLeaveRequestStatus.CANCELLED)
      return setPopupType(PolicyLeaveRequestStatus.CANCELLED);
    if (request.status === PolicyLeaveRequestStatus.REVOKED)
      return setPopupType(PolicyLeaveRequestStatus.REVOKED);
  }, [request, isManagerModalOpen]);

  useEffect(() => {
    if (popupType === PolicyLeaveRequestStatus.PENDING)
      setModalTitle(translateText(["approveModalTitle"]));
    else if (popupType === PolicyLeaveReviewModalEnums.DECLINE)
      setModalTitle(translateText(["declineModalTitle"]));
    else if (popupType === PolicyLeaveRequestStatus.APPROVED)
      setModalTitle(translateText(["approvedModalTitle"]));
    else if (popupType === PolicyLeaveRequestStatus.DENIED)
      setModalTitle(translateText(["deniedModalTitle"]));
    else if (popupType === PolicyLeaveRequestStatus.REVOKED)
      setModalTitle(translateText(["revokedModalTitle"]));
    else if (popupType === PolicyLeaveRequestStatus.CANCELLED)
      setModalTitle(translateText(["cancelledModalTitle"]));
    else if (popupType === PolicyLeaveReviewModalEnums.DECLINE_STATUS)
      setModalTitle(translateText(["deniedModalTitle"]));
    else if (popupType === PolicyLeaveReviewModalEnums.APPROVED_STATUS)
      setModalTitle(translateText(["approvedModalTitle"]));
  }, [popupType, isManagerModalOpen]);

  const modalContent = (): ReactNode => {
    if (!request) return null;
    if (popupType === PolicyLeaveRequestStatus.PENDING)
      return (
        <PolicyLeaveReviewModal request={request} setPopupType={setPopupType} />
      );
    if (
      popupType === PolicyLeaveReviewModalEnums.APPROVED_STATUS ||
      popupType === PolicyLeaveReviewModalEnums.DECLINE_STATUS ||
      popupType === PolicyLeaveRequestStatus.DENIED ||
      popupType === PolicyLeaveRequestStatus.APPROVED ||
      popupType === PolicyLeaveRequestStatus.CANCELLED ||
      popupType === PolicyLeaveRequestStatus.REVOKED
    )
      return (
        <PolicyLeaveReviewResultModal
          request={request}
          closeModel={closeModel}
          popupType={popupType}
          setPopupType={setPopupType}
        />
      );
    if (popupType === PolicyLeaveReviewModalEnums.DECLINE)
      return (
        <PolicyLeaveDeclineModal
          request={request}
          closeModel={closeModel}
          setPopupType={setPopupType}
        />
      );
    return null;
  };

  return (
    <SmallModal
      isOpen={isManagerModalOpen && !!popupType}
      onClose={closeModel}
      modalHeader={modalTitle}
      content={modalContent()}
    />
  );
};

export default PolicyLeaveReviewModalController;
