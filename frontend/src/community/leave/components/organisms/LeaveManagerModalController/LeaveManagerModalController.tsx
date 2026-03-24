import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveExtraPopupTypes,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";

import OnLeaveModal from "../../molecules/AvailabilityCalendar/OnLeaveModal";
import LeaveManagerSuccessModal from "../../molecules/ManagerLeaveModalContents/LeaveManagerSuccessModal/LeaveManagerSuccessModal";
import ManagerApproveLeaveModal from "../../molecules/ManagerLeaveModalContents/ManagerApproveLeaveModal/ManagerApproveLeaveModal";
import ManagerDeclineLeaveModal from "../../molecules/ManagerLeaveModalContents/ManagerDeclineLeaveModal/ManagerDeclineLeaveModal";

const LeaveManagerModalController = () => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveModals"
  );
  const {
    leaveRequestData,
    isManagerModalOpen,
    setIsManagerModal,
    removeLeaveRequestRowData,
    removeNewLeaveId,
    isOnLeaveModalOpen,
    onLeaveModalTitle,
    setIsOnLeaveModalOpen
  } = useLeaveStore((state) => ({
    removeLeaveRequestRowData: state.removeLeaveRequestRowData,
    leaveRequestData: state.leaveRequestData,
    isManagerModalOpen: state.isManagerModalOpen,
    setIsManagerModal: state.setIsManagerModal,
    removeNewLeaveId: state.removeNewLeaveId,
    isOnLeaveModalOpen: state.isOnLeaveModalOpen,
    onLeaveModalTitle: state.onLeaveModalTitle,
    setIsOnLeaveModalOpen: state.setIsOnLeaveModalOpen
  }));
  const [modalTitle, setModalTitle] = useState<string>("");
  const [popupType, setPopupType] = useState<
    LeaveStatusTypes | LeaveExtraPopupTypes | string
  >("");

  const closeModel = (): void => {
    setIsManagerModal(false);
    setPopupType("");
    removeNewLeaveId();
    removeLeaveRequestRowData();
    setIsOnLeaveModalOpen(false);
  };

  const handelManagerModal = (): void => {
    if (
      popupType !== LeaveExtraPopupTypes.APPROVED_STATUS &&
      popupType !== LeaveExtraPopupTypes.DECLINE_STATUS &&
      popupType !== LeaveExtraPopupTypes.REVOKE_SUMMARY_POPUP
    )
      setIsManagerModal(false);

    setIsManagerModal(false);
    setPopupType("");
    removeNewLeaveId();
    removeLeaveRequestRowData();

    if (popupType === LeaveExtraPopupTypes.ON_LEAVE_MODAL) {
      setIsOnLeaveModalOpen(false);
    }
  };

  useEffect(() => {
    if (leaveRequestData.status === LeaveStatusTypes.PENDING)
      return setPopupType(LeaveStatusTypes.PENDING);
    if (leaveRequestData.status === LeaveStatusTypes.DENIED)
      return setPopupType(LeaveStatusTypes.DENIED);
    if (leaveRequestData.status === LeaveStatusTypes.APPROVED)
      return setPopupType(LeaveStatusTypes.APPROVED);
    if (leaveRequestData.status === LeaveStatusTypes.CANCELLED)
      return setPopupType(LeaveStatusTypes.CANCELLED);
    if (leaveRequestData.status === LeaveStatusTypes.REVOKED)
      return setPopupType(LeaveStatusTypes.REVOKED);
    if (isOnLeaveModalOpen)
      return setPopupType(LeaveExtraPopupTypes.ON_LEAVE_MODAL);
  }, [leaveRequestData, isManagerModalOpen, isOnLeaveModalOpen]);

  useEffect(() => {
    if (popupType === LeaveStatusTypes.PENDING)
      setModalTitle(translateText(["approveModalTitle"]));
    else if (popupType === LeaveExtraPopupTypes.DECLINE)
      setModalTitle(translateText(["declineModalTitle"]));
    else if (popupType === LeaveStatusTypes.APPROVED)
      setModalTitle(translateText(["approvedModalTitle"]));
    else if (popupType === LeaveStatusTypes.DENIED)
      setModalTitle(translateText(["deniedModalTitle"]));
    else if (popupType === LeaveStatusTypes.REVOKED)
      setModalTitle(translateText(["revokedModalTitle"]));
    else if (popupType === LeaveStatusTypes.CANCELLED)
      setModalTitle(translateText(["cancelledModalTitle"]));
    else if (popupType === LeaveExtraPopupTypes.DECLINE_STATUS)
      setModalTitle(translateText(["deniedModalTitle"]));
    else if (popupType === LeaveExtraPopupTypes.APPROVED_STATUS)
      setModalTitle(translateText(["approvedModalTitle"]));
    else if (popupType === LeaveExtraPopupTypes.ON_LEAVE_MODAL)
      setModalTitle(onLeaveModalTitle);
  }, [popupType, isManagerModalOpen]);

  const modalContent = (): ReactNode => {
    if (popupType === LeaveStatusTypes.PENDING)
      return <ManagerApproveLeaveModal setPopupType={setPopupType} />;
    if (
      popupType === LeaveExtraPopupTypes.APPROVED_STATUS ||
      popupType === LeaveExtraPopupTypes.DECLINE_STATUS ||
      popupType === LeaveExtraPopupTypes.REVOKE_POPUP ||
      popupType === LeaveStatusTypes.DENIED ||
      popupType === LeaveStatusTypes.APPROVED ||
      popupType === LeaveStatusTypes.CANCELLED ||
      popupType === LeaveStatusTypes.REVOKED
    )
      return (
        <LeaveManagerSuccessModal
          closeModel={closeModel}
          popupType={popupType}
          setPopupType={setPopupType}
        />
      );
    if (popupType === LeaveExtraPopupTypes.DECLINE)
      return (
        <ManagerDeclineLeaveModal
          closeModel={closeModel}
          setPopupType={setPopupType}
        />
      );
    if (popupType === LeaveExtraPopupTypes.ON_LEAVE_MODAL)
      return <OnLeaveModal />;
    return null;
  };

  return (
    <SmallModal
      isOpen={isManagerModalOpen && !!popupType}
      onClose={handelManagerModal}
      modalHeader={modalTitle}
      content={modalContent()}
    />
  );
};

export default LeaveManagerModalController;
