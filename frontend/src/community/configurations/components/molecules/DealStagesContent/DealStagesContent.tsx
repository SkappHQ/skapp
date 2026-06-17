import { useEffect, useRef, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DraggableDealStageCardSkeleton from "~community/configurations/components/molecules/DealStageCard/DraggableDealStageCardSkeleton";
import DealStagesDraggableContent from "~community/configurations/components/molecules/DealStagesDraggableContent/DealStagesDraggableContent";
import { useGetDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DealStagesContentProps {
  onEdit: (stage: CrmDealStageType) => void;
  onDelete: (stage: CrmDealStageType) => void;
}

const DealStagesContent = ({ onEdit, onDelete }: DealStagesContentProps) => {
  const translateText = useTranslator("configurations", "crm");
  const { setToastMessage } = useToast();
  const { data: dealStages, isError, isLoading } = useGetDealStages();
  const hasShownErrorToast = useRef(false);
  const [stages, setStages] = useState<CrmDealStageType[]>([]);

  useEffect(() => {
    if (dealStages) setStages(dealStages);
  }, [dealStages]);

  useEffect(() => {
    if (!isError || hasShownErrorToast.current) return;

    hasShownErrorToast.current = true;

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "fetchError", "title"]),
      description: translateText(["toasts", "fetchError", "description"])
    });
  }, [isError, setToastMessage, translateText]);

  if (isLoading) return <DraggableDealStageCardSkeleton />;

  if (isError) {
    return (
      <p className="body2 text-secondary-text">
        {translateText(["dealsSection", "fetchError"])}
      </p>
    );
  }

  return (
    <DealStagesDraggableContent
      stagesData={stages}
      onStagesReorder={setStages}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default DealStagesContent;
