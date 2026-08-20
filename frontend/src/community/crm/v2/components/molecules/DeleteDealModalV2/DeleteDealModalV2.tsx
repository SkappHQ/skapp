import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import CrmDeleteModalContent from "~community/crm/components/molecules/CrmDeleteModalContent/CrmDeleteModalContent";
import { useDeleteDeal } from "~community/crm/v2/api/DealApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { removeDeal } from "~community/crm/v2/utils/dealIngest";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dealName: string;
}

const DeleteDealModalV2: FC<Props> = ({ isOpen, onClose, dealName }) => {
  const translateText = useTranslator("crmModule", "deals", "deleteDealModal");

  const { setToastMessage } = useToast();

  const { selectedDealId, setSelectedDealId, closeCrmSidePanel } =
    useCrmStoreV2((store) => ({
      selectedDealId: store.selectedDealId,
      setSelectedDealId: store.setSelectedDealId,
      closeCrmSidePanel: store.closeCrmSidePanel
    }));

  const handleSuccess = (): void => {
    if (selectedDealId === null) return;

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toastMessages", "successTitle"]),
      description: translateText(["toastMessages", "successDescription"])
    });

    removeDeal(selectedDealId);
    onClose();
    closeCrmSidePanel();
    setSelectedDealId(null);
  };

  const handleError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText(["toastMessages", "errorDescription"])
    });
  };

  const { mutate: deleteDeal, isPending } = useDeleteDeal(
    handleSuccess,
    handleError
  );

  const handleDeleteDeal = (): void => {
    if (selectedDealId === null) return;
    deleteDeal(selectedDealId);
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["title"])}
      content={
        <CrmDeleteModalContent
          description={translateText(["description"], { dealName })}
          isPending={isPending}
          confirmLabel={translateText(["buttons", "confirm"])}
          cancelLabel={translateText(["buttons", "cancel"])}
          onConfirm={handleDeleteDeal}
          onClose={onClose}
        />
      }
    />
  );
};

export default DeleteDealModalV2;
