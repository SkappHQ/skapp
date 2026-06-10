import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealModalTypes } from "~community/crm/types/ModalTypes";

const DeleteDealModalContent: React.FC = () => {
  const {
    currentDeletingDeal,
    setIsDealModalOpen,
    setDealModalType,
    setCurrentDeletingDeal
  } = useCrmStore((store) => ({
    currentDeletingDeal: store.currentDeletingDeal,
    setIsDealModalOpen: store.setIsDealModalOpen,
    setDealModalType: store.setDealModalType,
    setCurrentDeletingDeal: store.setCurrentDeletingDeal
  }));

  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");

  const handleCloseModal = () => {
    setIsDealModalOpen(false);
    setDealModalType(CrmDealModalTypes.NONE);
    setCurrentDeletingDeal(null);
  };

  const handleDeleteDeal = () => {
    // Add handle delete functionality with Toast messages for success and error cases
    handleCloseModal();
  };

  return (
    <div className="flex flex-col">
      <div>{translateText(["description"], { dealName: currentDeletingDeal?.name })}</div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="error"
          type="button"
          icon={
            <DeleteButtonIcon
              height="12px"
              width="9.33px"
              fill="var(--color-semantic-red-text)"
            />
          }
          iconPosition="end"
          onClick={handleDeleteDeal}
          aria-label={translateText(["ariaLabels", "confirm"])}
        >
          {translateText(["buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteDealModalContent;
