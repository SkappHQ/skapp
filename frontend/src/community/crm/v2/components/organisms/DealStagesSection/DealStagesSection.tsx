import {
  ButtonV2,
  CloseIcon,
  PlusIcon,
  SaveIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetDealStages,
  useReorderDealStages
} from "~community/crm/v2/api/DealApi";
import DealStagesDraggableContent from "~community/crm/v2/components/molecules/DealStagesDraggableContent/DealStagesDraggableContent";
import DraggableDealStageCardSkeleton from "~community/crm/v2/components/molecules/DraggableDealStageCard/DraggableDealStageCardSkeleton";
import DealStageModalController from "~community/crm/v2/components/organisms/DealStageModalController/DealStageModalController";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmStageEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmModalTypes } from "~community/crm/v2/types/CrmTypes";
import {
  getOrderedStages,
  toStagesRecord
} from "~community/crm/v2/utils/commonUtil";
import { toStageReorderPayload } from "~community/crm/v2/utils/stageUtil";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

const DealStagesSection: FC = () => {
  const translateText = useTranslator("configurations", "crm");

  const { setToastMessage } = useToast();
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const {
    stages,
    setStages,
    setIsDealStageModalOpen,
    setDealStageModalType,
    setSelectedDealStageId
  } = useCrmStoreV2(
    useShallow((store) => ({
      stages: store.stages,
      setStages: store.setStages,
      setIsDealStageModalOpen: store.setIsDealStageModalOpen,
      setDealStageModalType: store.setDealStageModalType,
      setSelectedDealStageId: store.setSelectedDealStageId
    }))
  );

  const {
    data: fetchedStages,
    isLoading,
    refetch: refetchStages
  } = useGetDealStages();

  const orderedStages = useMemo(() => getOrderedStages(stages), [stages]);

  const [draftStages, setDraftStages] = useState<CrmStageEntity[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!fetchedStages) return;

    setStages(toStagesRecord(fetchedStages));
  }, [fetchedStages]);

  useEffect(() => {
    if (hasChanges) return;

    setDraftStages(orderedStages);
  }, [orderedStages, hasChanges]);

  const handleSuccess = (reorderedStages: CrmStageEntity[]) => {
    setStages({ ...stages, ...toStagesRecord(reorderedStages) });
    setHasChanges(false);
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "dealsSection",
        "toastMessages",
        "reorderSuccessTitle"
      ]),
      description: translateText([
        "dealsSection",
        "toastMessages",
        "reorderSuccessDescription"
      ])
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "dealsSection",
        "toastMessages",
        "reorderErrorTitle"
      ]),
      description: translateText([
        "dealsSection",
        "toastMessages",
        "reorderErrorDescription"
      ])
    });
  };

  const { mutate: reorderStages, isPending: isReordering } =
    useReorderDealStages(handleSuccess, handleError);

  const handleStagesReorder = (reordered: CrmStageEntity[]) => {
    setDraftStages(reordered);
    setHasChanges(true);
  };

  const handleCancelReorder = () => {
    setDraftStages(orderedStages);
    setHasChanges(false);
  };

  const handleEdit = (stage: CrmStageEntity) => {
    if (stage.id === undefined) return;

    setSelectedDealStageId(stage.id);
    setDealStageModalType(CrmModalTypes.EDIT_DEAL_STAGE_MODAL);
    setIsDealStageModalOpen(true);
  };

  const handleDelete = (stage: CrmStageEntity) => {
    if (stage.id === undefined) return;

    setSelectedDealStageId(stage.id);
    setDealStageModalType(CrmModalTypes.DELETE_DEAL_STAGE_MODAL);
    setIsDealStageModalOpen(true);
  };

  const handleSaveReorder = () => {
    reorderStages(toStageReorderPayload(draftStages));
  };

  const handleAddStage = () => {
    guardCrmCreate(CrmLimitResource.DEAL_STAGES, () => {
      setSelectedDealStageId(null);
      setDealStageModalType(CrmModalTypes.ADD_DEAL_STAGE_MODAL);
      setIsDealStageModalOpen(true);
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <h2 className="subtitle2">
            {translateText(["dealsSection", "dealPipelineStatusesTitle"])}
          </h2>
          <ButtonV2
            variant="primary"
            onClick={handleAddStage}
            icon={<PlusIcon />}
            iconPosition="end"
            size="md"
            isLoading={isCheckingCrmLimit}
          >
            {translateText(["dealsSection", "buttons", "add"])}
          </ButtonV2>
        </div>

        {isLoading ? (
          <DraggableDealStageCardSkeleton />
        ) : (
          <DealStagesDraggableContent
            stagesData={draftStages}
            onStagesReorder={handleStagesReorder}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <div className="flex flex-row justify-start gap-4">
        <ButtonV2
          variant="tertiary"
          onClick={handleCancelReorder}
          icon={<CloseIcon />}
          iconPosition="end"
          disabled={!hasChanges || isReordering}
        >
          {translateText(["buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={handleSaveReorder}
          icon={<SaveIcon />}
          iconPosition="end"
          disabled={!hasChanges || isReordering}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>

      <DealStageModalController onStageCreated={refetchStages} />
    </>
  );
};

export default DealStagesSection;
