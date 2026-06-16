import { useEffect, useState } from "react";

import { useGetDealStages } from "~community/configurations/api/crmConfigurationApi";
import DraggableDealStageCardSkeleton from "~community/configurations/components/molecules/DealStageCard/DraggableDealStageCardSkeleton";
import DealStagesDraggableContent from "~community/configurations/components/molecules/DealStagesDraggableContent/DealStagesDraggableContent";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

interface DealStagesContentProps {
  onEdit: (stage: CrmDealStageType) => void;
  onDelete: (stage: CrmDealStageType) => void;  
}

const DealStagesContent = ({ onEdit, onDelete }: DealStagesContentProps) => {
  const { data: dealStages, isLoading } = useGetDealStages();

  if (isLoading) return <DraggableDealStageCardSkeleton />;

  return (
    <DealStagesDraggableContent
      stagesData={dealStages || []}
      onStagesReorder={() => {}}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default DealStagesContent;
