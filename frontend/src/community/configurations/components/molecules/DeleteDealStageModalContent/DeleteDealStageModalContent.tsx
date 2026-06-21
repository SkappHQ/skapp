import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { useDealStageById, useDeleteDealStage } from "~community/crm/api/crmDealApi";

const DeleteDealStageModalContent: FC = () => {
  const translateText = useTranslator("configurations", "crm");
  const { setToastMessage } = useToast();

  const { selectedDealStageId, setIsDealStageModalOpen } = useConfigurationStore(
    (store) => ({
      selectedDealStageId: store.selectedDealStageId,
      setIsDealStageModalOpen: store.setIsDealStageModalOpen
    })
  );

  const selectedDealStage = useDealStageById(selectedDealStageId);

  const handleCloseModal = () => {
    setIsDealStageModalOpen(false);
  };

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["deleteDealStageModal", "toastMessages", "successTitle"]),
      description: translateText([
        "deleteDealStageModal",
        "toastMessages",
        "successDescription"
      ])
    });
    handleCloseModal();
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["deleteDealStageModal", "toastMessages", "errorTitle"]),
      description: translateText([
        "deleteDealStageModal",
        "toastMessages",
        "errorDescription"
      ])
    });
  };

  const { mutate: deleteStage, isPending } = useDeleteDealStage(
    handleSuccess,
    handleError
  );

  const handleDeleteStage = () => {
    if (selectedDealStage?.id === undefined) return;
    deleteStage(selectedDealStage.id);
  };

  return (
    <div className="flex flex-col">
      <div>
        {translateText(["deleteDealStageModal", "description"], {
          stageName: selectedDealStage?.name
        })}
      </div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText(["deleteDealStageModal", "buttons", "cancel"])}
        >
          {translateText(["deleteDealStageModal", "buttons", "cancel"])}
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
          onClick={handleDeleteStage}
          disabled={isPending}
          aria-label={translateText(["deleteDealStageModal", "buttons", "confirm"])}
        >
          {translateText(["deleteDealStageModal", "buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteDealStageModalContent;
