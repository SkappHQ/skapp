import { FC, useCallback } from "react";

import ModalController from "~community/common/components/organisms/ModalController/ModalController";
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
    setIsLeaveCarryForwardModalOpen(false);
    setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
  }, [setIsLeaveCarryForwardModalOpen, setLeaveCarryForwardModalType]);

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

  const getIds = (): {
    title?: string;
    description?: string;
    closeButton?: string;
  } => {
    switch (leaveCarryForwardModalType) {
      case LeaveCarryForwardModalTypes.CARRY_FORWARD:
        return {
          title: "leave-carry-forward-modal-title",
          description: "leave-carry-forward-modal-description",
          closeButton: "leave-carry-forward-modal-close-button"
        };
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE:
        return {
          title: "no-carry-forward-leave-types-modal-title",
          description: "no-carry-forward-leave-types-modal-description",
          closeButton: "no-carry-forward-leave-types-modal-close-button"
        };
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE:
        return {
          title: "leave-carry-forward-ineligible-modal-title",
          description: "leave-carry-forward-ineligible-modal-description",
          closeButton: "leave-carry-forward-ineligible-modal-close-button"
        };
      case LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION:
        return {
          title: "leave-carry-forward-confirm-synchronization-modal-title",
          description:
            "leave-carry-forward-confirm-synchronization-modal-description",
          closeButton:
            "leave-carry-forward-confirm-synchronization-modal-close-button"
        };
      default:
        return {
          title: "modal-title",
          description: "modal-description",
          closeButton: "modal-close-button"
        };
    }
  };

  const handleClose = () => {
    setIsLeaveCarryForwardModalOpen(false);
    setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.NONE);
  };

  return (
    <ModalController
      ids={getIds()}
      isModalOpen={isLeaveCarryForwardModalOpen}
      handleCloseModal={handleCloseModal}
      modalTitle={getModalTitle()}
      isClosable={
        leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD ||
        leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION
      }
    >
      <>
        {leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD && (
          <LeaveCarryForwardTypeContent handleClose={handleClose} />
        )}
        {leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE && (
          <NoCarryForwardLeaveTypes handleClose={handleClose} />
        )}
        {leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD_INELIGIBLE && (
          <LeaveCarryForwardUnEligible />
        )}
        {leaveCarryForwardModalType ===
          LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION && (
          <LeaveCarryForwardSyncConfirmation handleClose={handleClose} />
        )}
      </>
    </ModalController>
  );
};

export default LeaveCarryForwardModalController;
