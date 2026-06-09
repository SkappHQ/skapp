import { SmallModal } from "@rootcodelabs/skapp-ui";

import { useCrmStore } from "~community/crm/store/store";

import DeleteDealModalContent from "../../molecules/DeleteDealModalContent/DeleteDealModalContent";

const DealModalController = () => {
  const { isDealDeleteModalOpen, setIsDealDeleteModalOpen, setDealToDelete } =
    useCrmStore((store) => ({
      isDealDeleteModalOpen: store.isDealDeleteModalOpen,
      setIsDealDeleteModalOpen: store.setIsDealDeleteModalOpen,
      setDealToDelete: store.setDealToDelete
    }));

  const handleCloseModal = (): void => {
    setIsDealDeleteModalOpen(false);
    setDealToDelete(null);
  };

  return (
    <SmallModal
      isOpen={isDealDeleteModalOpen}
      onClose={handleCloseModal}
      modalHeader="Are you sure?"
      content={<DeleteDealModalContent />}
    />
  );
};

export default DealModalController;
