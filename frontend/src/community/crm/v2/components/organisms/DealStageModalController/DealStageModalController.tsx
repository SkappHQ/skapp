import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import DealStageModalForm from "~community/crm/v2/components/molecules/DealStageModalForm/DealStageModalForm";
import DeleteDealStageModalContent from "~community/crm/v2/components/molecules/DeleteDealStageModalContent/DeleteDealStageModalContent";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";

interface DealStageModalControllerProps {
  onStageCreated: () => void;
}

const DealStageModalController: FC<DealStageModalControllerProps> = ({
  onStageCreated
}) => {
  const translateText = useTranslator("configurations", "crm");

  const { isDealStageModalOpen, dealStageModalType, setIsDealStageModalOpen } =
    useCrmStoreV2(
      useShallow((store) => ({
        isDealStageModalOpen: store.isDealStageModalOpen,
        dealStageModalType: store.dealStageModalType,
        setIsDealStageModalOpen: store.setIsDealStageModalOpen
      }))
    );

  const handleCloseModal = (): void => {
    setIsDealStageModalOpen(false);
  };

  const getModalTitle = (modalType: CrmModalTypes): string => {
    switch (modalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return translateText(["addDealStageModal", "title"]);
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return translateText(["editDealStageModal", "title"]);
      case CrmModalTypes.DELETE_DEAL_STAGE_MODAL:
        return translateText(["deleteDealStageModal", "title"]);
      default:
        return "";
    }
  };

  const getModalContent = (): ReactNode => {
    switch (dealStageModalType) {
      case CrmModalTypes.ADD_DEAL_STAGE_MODAL:
        return <DealStageModalForm onStageCreated={onStageCreated} />;
      case CrmModalTypes.EDIT_DEAL_STAGE_MODAL:
        return <DealStageModalForm isEdit />;
      case CrmModalTypes.DELETE_DEAL_STAGE_MODAL:
        return <DeleteDealStageModalContent />;
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
