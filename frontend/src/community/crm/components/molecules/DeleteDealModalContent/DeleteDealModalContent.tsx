import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCrmStore } from "~community/crm/store/store";

const DeleteDealModalContent: React.FC = () => {
  const { setToastMessage } = useToast();

  const { dealToDelete, setIsDealModalOpen, setDealToDelete } =
    useCrmStore((store) => ({
      dealToDelete: store.dealToDelete,
      setIsDealModalOpen: store.setIsDealModalOpen,
      setDealToDelete: store.setDealToDelete
    }));

  const translateText = useTranslator(
    "crmModule",
    "deals",
    "deleteDealModal"
  );

  const translateToasts = useTranslator(
    "crmModule",
    "deals",
    "deleteDealToastMessages"
  );

  const handleCloseModal = () => {
    setIsDealModalOpen(false);
    setDealToDelete(null);
  };

  const handleDeleteDeal = () => {
     // Add handle delete functionality with Toast messages for success and error cases
  };

  return (
    <div className="flex flex-col">
      <div>
        {translateText(["description"], { dealName: dealToDelete })}
      </div>
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
