import { useSortable } from "@dnd-kit/react/sortable";
import { FC, useMemo } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import { CrmBoardDealType } from "~community/crm/types/BoardTypes";

interface DraggableDealCardProps {
  deal: CrmBoardDealType;
  index: number;
  stageId: number;
  onDealClick: (dealId: number) => void;
}

const DraggableDealCard: FC<DraggableDealCardProps> = ({
  deal,
  index,
  stageId,
  onDealClick
}) => {
  const data = useMemo(() => ({ type: "deal" as const, deal }), [deal]);

  const { ref, isDragging } = useSortable({
    id: deal.id,
    index,
    group: stageId,
    accept: "deal",
    type: "deal",
    data
  });

  return (
    <div
      ref={ref}
      id={String(deal.id)}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className={`cursor-grab active:cursor-grabbing transform-gpu ${
        isDragging ? `z-[${ZIndexEnums.CRM_SIDE_PANEL}] shadow-lg` : ""
      }`}
    >
      <DealCard
        id={deal.id}
        title={deal.name}
        contactName={deal.contactName}
        companyName={deal.companyName ?? undefined}
        owner={deal.owner}
        amount={deal.amount ?? ""}
        priority={deal.priority}
        taskCount={deal.taskCount}
        onClick={() => onDealClick(deal.id)}
      />
    </div>
  );
};

export default DraggableDealCard;
