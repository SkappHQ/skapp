import { useEffect, useState } from "react";

import DraggableDealStageCardSkeleton from "~community/configurations/components/molecules/DealStageCard/DraggableDealStageCardSkeleton";
import DealStagesDraggableContent from "~community/configurations/components/molecules/DealStagesDraggableContent/DealStagesDraggableContent";
import useGetDealStageOptions from "~community/crm/hooks/useGetDealStageOptions";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DealStagesContentProps {
  onEdit: (stage: CrmDealStageType) => void;
  onDelete: (stage: CrmDealStageType) => void;
}

const DealStagesContent = ({ onEdit, onDelete }: DealStagesContentProps) => {
  const { options: dealStages, isPending } = useGetDealStageOptions();
  const [stages, setStages] = useState<CrmDealStageType[]>([]);

  useEffect(() => {
    if (dealStages) setStages(dealStages);
  }, [dealStages]);

  if (isPending) return <DraggableDealStageCardSkeleton />;

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
