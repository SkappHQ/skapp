import { LargeModal, SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import ApplyPolicyLeaveModal from "~community/leave/components/molecules/PolicyLeaveModals/ApplyPolicyLeaveModal/ApplyPolicyLeaveModal";
import DiscardPolicyLeaveModal from "~community/leave/components/molecules/PolicyLeaveModals/DiscardPolicyLeaveModal/DiscardPolicyLeaveModal";
import PolicyAddAttachmentModal from "~community/leave/components/molecules/PolicyLeaveModals/PolicyAddAttachmentModal/PolicyAddAttachmentModal";
import PolicySelectionModal from "~community/leave/components/molecules/PolicyLeaveModals/PolicySelectionModal/PolicySelectionModal";
import PolicyTeamAvailabilityModal from "~community/leave/components/molecules/PolicyLeaveModals/PolicyTeamAvailabilityModal/PolicyTeamAvailabilityModal";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { selectHasUnsavedChanges } from "~community/leave/utils/policyLeave/policyLeaveUtils";

const PolicyLeaveModalController = () => {
  const translateText = useTranslator("leaveModule", "myRequests");

  const isModalOpen = usePolicyLeaveStore((state) => state.isModalOpen);
  const modalType = usePolicyLeaveStore((state) => state.modalType);
  const setModalType = usePolicyLeaveStore((state) => state.setModalType);
  const hasUnsavedChanges = usePolicyLeaveStore(selectHasUnsavedChanges);

  const modalTitle = useMemo(() => {
    switch (modalType) {
      case PolicyLeaveModalEnums.APPLY_POLICY_LEAVE:
      case PolicyLeaveModalEnums.POLICY_SELECTION:
        return translateText(["applyPolicyLeaveModal", "title"]);
      case PolicyLeaveModalEnums.ADD_ATTACHMENT:
        return translateText(["addAttachmentModal", "title"]);
      case PolicyLeaveModalEnums.TEAM_AVAILABILITY:
        return translateText(["teamAvailabilityCard", "title"]);
      case PolicyLeaveModalEnums.DISCARD_CHANGES:
        return translateText(["discardPolicyLeaveModal", "title"]);
      default:
        return "";
    }
  }, [modalType, translateText]);

  const handleCloseModal = () => {
    switch (modalType) {
      case PolicyLeaveModalEnums.ADD_ATTACHMENT:
      case PolicyLeaveModalEnums.TEAM_AVAILABILITY:
      case PolicyLeaveModalEnums.DISCARD_CHANGES:
        setModalType(PolicyLeaveModalEnums.APPLY_POLICY_LEAVE);
        break;
      case PolicyLeaveModalEnums.APPLY_POLICY_LEAVE:
        setModalType(
          hasUnsavedChanges
            ? PolicyLeaveModalEnums.DISCARD_CHANGES
            : PolicyLeaveModalEnums.NONE
        );
        break;
      default:
        setModalType(PolicyLeaveModalEnums.NONE);
        break;
    }
  };

  const modalContent = (): ReactNode => {
    switch (modalType) {
      case PolicyLeaveModalEnums.APPLY_POLICY_LEAVE:
        return <ApplyPolicyLeaveModal />;
      case PolicyLeaveModalEnums.POLICY_SELECTION:
        return <PolicySelectionModal />;
      case PolicyLeaveModalEnums.ADD_ATTACHMENT:
        return <PolicyAddAttachmentModal />;
      case PolicyLeaveModalEnums.TEAM_AVAILABILITY:
        return <PolicyTeamAvailabilityModal />;
      case PolicyLeaveModalEnums.DISCARD_CHANGES:
        return <DiscardPolicyLeaveModal />;
      default:
        return null;
    }
  };

  const isLargeModal =
    modalType === PolicyLeaveModalEnums.APPLY_POLICY_LEAVE ||
    modalType === PolicyLeaveModalEnums.POLICY_SELECTION;

  if (isLargeModal) {
    return (
      <LargeModal
        id="apply-policy-leave-modal"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modalHeader={modalTitle}
        content={modalContent()}
        backdropVariant="dark"
        className="w-[75vw] max-w-[1100px]"
      />
    );
  }

  return (
    <SmallModal
      isOpen={isModalOpen && modalType !== PolicyLeaveModalEnums.NONE}
      onClose={handleCloseModal}
      modalHeader={modalTitle}
      content={modalContent()}
    />
  );
};

export default PolicyLeaveModalController;
