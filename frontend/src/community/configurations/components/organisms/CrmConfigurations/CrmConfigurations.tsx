import {
  ButtonV2,
  CloseIcon,
  Dropdown,
  InfoIcon,
  PlusIcon,
  SaveIcon
} from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DraggableDealStageCardSkeleton from "~community/configurations/components/molecules/DealStageCard/DraggableDealStageCardSkeleton";
import DealStagesDraggableContent from "~community/configurations/components/molecules/DealStagesDraggableContent/DealStagesDraggableContent";
import DealStageModalController from "~community/configurations/components/organisms/DealStageModalController/DealStageModalController";
import { useConfigurationStore } from "~community/configurations/stores/configurationStore";
import { useReorderDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import useGetDealStageOptions from "~community/crm/hooks/useGetDealStageOptions";

const CrmConfigurations = () => {
  const translateText = useTranslator("configurations", "crm");

  const {
    setIsDealStageModalOpen,
    setDealStageModalType,
    setSelectedDealStageId
  } = useConfigurationStore((store) => ({
    setIsDealStageModalOpen: store.setIsDealStageModalOpen,
    setDealStageModalType: store.setDealStageModalType,
    setSelectedDealStageId: store.setSelectedDealStageId
  }));

  const { setToastMessage } = useToast();

  const { options: dealStages, isPending } = useGetDealStageOptions();
  const [stages, setStages] = useState<CrmDealStageType[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { mutate: reorderStages, isPending: isReordering } = useReorderDealStages(
    () => {
      setHasChanges(false);
      setToastMessage({
        open: true,
        toastType: ToastType.SUCCESS,
        title: translateText(["dealsSection", "toastMessages", "reorderSuccessTitle"]),
        description: translateText(["dealsSection", "toastMessages", "reorderSuccessDescription"])
      });
    },
    () => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["dealsSection", "toastMessages", "reorderErrorTitle"]),
        description: translateText(["dealsSection", "toastMessages", "reorderErrorDescription"])
      });
    }
  );

  useEffect(() => {
    if (dealStages) {
      setStages(dealStages);
      setHasChanges(false);
    }
  }, [dealStages]);

  const handleStagesReorder = (reordered: CrmDealStageType[]) => {
    setStages(reordered);
    setHasChanges(true);
  };

  const handleCancelReorder = () => {
    if (dealStages) setStages(dealStages);
    setHasChanges(false);
  };

  const handleEdit = (stage: CrmDealStageType) => {
    setSelectedDealStageId(stage.id);
    setDealStageModalType(CrmModalTypes.EDIT_DEAL_STAGE_MODAL);
    setIsDealStageModalOpen(true);
  };

  const handleDelete = (stage: CrmDealStageType) => {
    setSelectedDealStageId(stage.id);
    setDealStageModalType(CrmModalTypes.DELETE_DEAL_STAGE_MODAL);
    setIsDealStageModalOpen(true);
  };

  const handleSaveReorder = () => {
    const payload = stages
      .filter(
        (s) =>
          s.stageType !== CrmDealStageEnum.WON &&
          s.stageType !== CrmDealStageEnum.LOST
      )
      .map((s, index) => ({ id: s.id, orderIndex: index + 1 }));
    reorderStages(payload);
  };

  const handleAddStage = () => {
    setSelectedDealStageId(null);
    setDealStageModalType(CrmModalTypes.ADD_DEAL_STAGE_MODAL);
    setIsDealStageModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-[49rem]">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="subtitle2">
            {translateText(["currencySection", "currencyPreferencesTitle"])}
          </h3>
          <p className="body1 text-secondary-text mt-4">
            {translateText([
              "currencySection",
              "currencyPreferencesDescription"
            ])}
          </p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div>
            <Dropdown
              options={[{ id: "usd", label: "USD - US Dollar", value: "USD" }]}
              value="USD"
              variant="primary-disabled"
              ariaLabel={translateText([
                "currencySection",
                "ariaLabel",
                "selectCurrency"
              ])}
              width="100%"
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <InfoIcon width={24} height={24} className="shrink-0" />
            <p className="body2">
              {translateText(["currencySection", "currencyInfoNote"])}
            </p>
          </div>
        </div>
      </div>
      <hr className="w-full border-t border-secondary-accent" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="subtitle2">
            {translateText(["dealsSection", "dealPipelineStatusesTitle"])}
          </h3>
          <ButtonV2
            variant="tertiary"
            onClick={handleAddStage}
            icon={<PlusIcon />}
            iconPosition="end"
            size="md"
            className="w-22 h-9"
          >
            {translateText(["dealsSection", "buttons", "add"])}
          </ButtonV2>
        </div>

        {isPending ? (
          <DraggableDealStageCardSkeleton />
        ) : (
          <DealStagesDraggableContent
            stagesData={stages}
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

      <DealStageModalController />
    </div>
  );
};

export default CrmConfigurations;
