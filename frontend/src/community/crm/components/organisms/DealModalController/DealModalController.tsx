import { SmallModal } from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealModalTypes } from "~community/crm/types/ModalTypes";

import DeleteDealModalContent from "../../molecules/DeleteDealModalContent/DeleteDealModalContent";

const DealModalController = () => {
  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");

  const {
    isDealModalOpen,
    dealModalType,
    setIsDealModalOpen,
    setDealModalType,
    setCurrentDeletingDeal
  } = useCrmStore((store) => ({
    isDealModalOpen: store.isDealModalOpen,
    dealModalType: store.dealModalType,
    setIsDealModalOpen: store.setIsDealModalOpen,
    setDealModalType: store.setDealModalType,
    setCurrentDeletingDeal: store.setCurrentDeletingDeal
  }));

  const handleCloseModal = (): void => {
    setIsDealModalOpen(false);
    setDealModalType(CrmDealModalTypes.NONE);
    setCurrentDeletingDeal(null);
  };

  const getModalTitle = (): string => {
    switch (dealModalType) {
      case CrmDealModalTypes.CONFIRM_DELETE:
        return translateText(["areYouSureModalTitle"]);
      default:
        return "";
    }
  };

  const modalContent = () => {
    switch (dealModalType) {
      case CrmDealModalTypes.CONFIRM_DELETE:
        return <DeleteDealModalContent />;
      default:
        return null;
    }
  };

  return (
    <SmallModal
      isOpen={isDealModalOpen && dealModalType !== CrmDealModalTypes.NONE}
      onClose={handleCloseModal}
      modalHeader={getModalTitle()}
      content={modalContent()}
    />
  );
};

export default DealModalController;
