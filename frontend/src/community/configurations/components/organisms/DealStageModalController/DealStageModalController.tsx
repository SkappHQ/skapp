import { SmallModal } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import AddDealStageModalContent from "~community/configurations/components/molecules/AddDealStageModalContent/AddDealStageModalContent";
import EditDealStageModalContent from "~community/configurations/components/molecules/EditDealStageModalContent/EditDealStageModalContent";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";

const DealStageModalController = () => {
  const translateText = useTranslator("configurations", "crm");

  const { isDealStageModalOpen, dealStageModalType, setIsDealStageModalOpen } =
    useConfigurationStore((store) => ({
      isDealStageModalOpen: store.isDealStageModalOpen,
      dealStageModalType: store.dealStageModalType,
      setIsDealStageModalOpen: store.setIsDealStageModalOpen
    }));

  const handleCloseModal = (): void => {
    setIsDealStageModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return translateText(["addDealStageModal", "title"]);
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return translateText(["editDealStageModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (dealStageModalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return <AddDealStageModalContent />;
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return <EditDealStageModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isDealStageModalOpen}
      onClose={handleCloseModal}
      modalHeader={getModalTitle(dealStageModalType)}
      content={getModalContent()}
    />
  );
};

export default DealStageModalController;
