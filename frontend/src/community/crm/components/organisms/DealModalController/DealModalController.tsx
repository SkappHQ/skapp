import { SmallModal } from "@rootcodelabs/skapp-ui";

import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { useCrmStore } from "~community/crm/store/store";

import DeleteDealModalContent from "../../molecules/DeleteDealModalContent/DeleteDealModalContent";

const DealModalController = () => {
  const { isDealModalOpen, dealModalType, setIsDealModalOpen, setDealToDelete } =
    useCrmStore((store) => ({
      isDealModalOpen: store.isDealModalOpen,
      dealModalType: store.dealModalType,
      setIsDealModalOpen: store.setIsDealModalOpen,
      setDealToDelete: store.setDealToDelete
    }));

  const handleCloseModal = (): void => {
    setIsDealModalOpen(false);
    setDealToDelete(null);
  };

  return (
    <SmallModal
      isOpen={isDealModalOpen && dealModalType === CrmModalTypes.DELETE_DEAL_MODAL}
      onClose={handleCloseModal}
      modalHeader="Are you sure?"
      content={<DeleteDealModalContent />}
    />
  );
};

export default DealModalController;
