import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { CrmModalTypes } from "~community/configurations/types/CrmTypes";
import AddDealStageModalContent from "~community/configurations/components/molecules/AddDealStageModalContent/AddDealStageModalContent";
import EditDealStageModalContent from "../../molecules/EditDealStageModalContent/EditDealStageModalContent";

const DealStageModalController = () => {
  const translateText = useTranslator("configurations", "crm");

  const {
    isAddDealStageModalOpen,
    dealStageModalType,
    setIsAddDealStageModalOpen
  } = useConfigurationStore((store) => ({
    isAddDealStageModalOpen: store.isAddDealStageModalOpen,
    dealStageModalType: store.dealStageModalType,
    setIsAddDealStageModalOpen: store.setIsAddDealStageModalOpen
  }));

  const handleCloseModal = (): void => {
    setIsAddDealStageModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes) => {
    switch (modalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return translateText(["addDealStagesModal", "title"]);
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return translateText(["editDealStagesModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (dealStageModalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return <AddDealStageModalContent />
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return <EditDealStageModalContent />
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isAddDealStageModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(dealStageModalType)}
      content={getModalContent()}
    />
  );
};

export default DealStageModalController;
