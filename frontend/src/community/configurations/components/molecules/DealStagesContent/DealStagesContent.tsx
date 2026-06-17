import { useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
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
  const { data: dealStages, isError, isLoading } = useGetDealStages();
  const [stages, setStages] = useState<CrmDealStageType[]>([]);

  useEffect(() => {
    if (dealStages) setStages(dealStages);
  }, [dealStages]);

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
