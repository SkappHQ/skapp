import { ButtonV2, CloseIcon, DeleteButtonIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useDeleteDealStage } from "~community/crm/v2/api/DealApi";
import useStageNameMapper from "~community/crm/v2/hooks/useStageNameMapper";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  getSelectedStage,
  removeStage
} from "~community/crm/v2/utils/stageUtil";

const DeleteDealStageModalContent: FC = () => {
  const translateText = useTranslator("configurations", "crm");
  const { setToastMessage } = useToast();
  const { getStageDisplayName } = useStageNameMapper();

  const { stages, setStages, selectedDealStageId, setIsDealStageModalOpen } =
    useCrmStoreV2(
      useShallow((store) => ({
        stages: store.stages,
        setStages: store.setStages,
        selectedDealStageId: store.selectedDealStageId,
        setIsDealStageModalOpen: store.setIsDealStageModalOpen
      }))
    );

  const selectedDealStage = getSelectedStage(stages, selectedDealStageId);

  const handleCloseModal = () => {
    setIsDealStageModalOpen(false);
  };

  const handleSuccess = () => {
    if (selectedDealStage?.id !== undefined) {
      setStages(removeStage(stages, selectedDealStage.id));
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "deleteDealStageModal",
        "toastMessages",
        "successTitle"
      ]),
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
      title: translateText([
        "deleteDealStageModal",
        "toastMessages",
        "errorTitle"
      ]),
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
    if (selectedDealStage?.id !== undefined) {
      deleteStage(selectedDealStage.id);
    }
  };

  return (
    <div className="flex flex-col">
      <div>
        {translateText(["deleteDealStageModal", "description"], {
          stageName: getStageDisplayName(selectedDealStage?.name)
        })}
      </div>
      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          onClick={handleCloseModal}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateText([
            "deleteDealStageModal",
            "buttons",
            "cancel"
          ])}
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
          aria-label={translateText([
            "deleteDealStageModal",
            "buttons",
            "confirm"
          ])}
        >
          {translateText(["deleteDealStageModal", "buttons", "confirm"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default DeleteDealStageModalContent;
