import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useCallback } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveCarryForwardSyncConfirmation from "~community/leave/components/molecules/LeaveCarryForwardModals/LeaveCarryForwardSyncConfirmation/LeaveCarryForwardSyncConfirmation";
import LeaveCarryForwardTypeContent from "~community/leave/components/molecules/LeaveCarryForwardModals/LeaveCarryForwardTypeContent/LeaveCarryForwardTypeContent";
import LeaveCarryForwardUnEligible from "~community/leave/components/molecules/LeaveCarryForwardModals/LeaveCarryForwardUnEligible/LeaveCarryForwardUnEligible";
import NoCarryForwardLeaveTypes from "~community/leave/components/molecules/LeaveCarryForwardModals/NoCarryForwardLeaveTypes/NoCarryForwardLeaveTypes";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";

const LeaveCarryForwardModalController: FC = () => {
  const translateText = useTranslator("leaveModule", "leaveCarryForward");

  const {
    isLeaveCarryForwardModalOpen,
    setIsLeaveCarryForwardModalOpen,
    setLeaveCarryForwardModalType,
    leaveCarryForwardModalType
  } = useLeaveStore((state) => state);

  const handleCloseModal = useCallback((): void => {
    if (
      leaveCarryForwardModalType ===
        LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE ||
      leaveCarryForwardModalType ===
        LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE
    )
      return;
    setIsLeaveCarryForwardModalOpen(false);
    setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
  }, [
    leaveCarryForwardModalType,
    setIsLeaveCarryForwardModalOpen,
    setLeaveCarryForwardModalType
  ]);

  const getModalTitle = useCallback((): string => {
    switch (leaveCarryForwardModalType) {
      case LeaveCarryForwardModalTypes.CARRY_FORWARD:
        return translateText(["leaveCarryForwardTypeSelectionModalTitle"]);
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE:
        return translateText([
          "leaveCarryForwardLeaveTypesNotAvailableModalTitle"
        ]);
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE:
        return translateText(["leaveCarryForwardUnEligibleModalTitle"]);
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION:
        return translateText(["leaveCarryForwardModalHeading"]);
      default:
        return "";
    }
  }, [leaveCarryForwardModalType, translateText]);

  const handleClose = () => {
    setIsLeaveCarryForwardModalOpen(false);
    setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
  };

  const modalContent = (): ReactNode => {
    switch (leaveCarryForwardModalType) {
      case LeaveCarryForwardModalTypes.CARRY_FORWARD:
        return <LeaveCarryForwardTypeContent handleClose={handleClose} />;
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE:
        return <NoCarryForwardLeaveTypes handleClose={handleClose} />;
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE:
        return <LeaveCarryForwardUnEligible />;
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION:
        return <LeaveCarryForwardSyncConfirmation handleClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={
        isLeaveCarryForwardModalOpen &&
        leaveCarryForwardModalType !== LeaveCarryForwardModalTypes.NONE
      }
      onClose={handleCloseModal}
      modalHeader={getModalTitle()}
      content={modalContent()}
    />
  );
};

export default LeaveCarryForwardModalController;
