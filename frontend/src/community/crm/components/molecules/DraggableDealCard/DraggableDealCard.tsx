import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import { CrmDealBoardType } from "~community/crm/types/CommonTypes";

interface DraggableDealCardProps {
  deal: CrmDealBoardType;
  onDealClick: (dealId: string) => void;
}

const DraggableDealCard: FC<DraggableDealCardProps> = ({
  deal,
  onDealClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: deal.id,
    data: { type: "deal", deal }
  });

  return (
    <div
      ref={setNodeRef}
      id={String(deal.id)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
      }}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transform-gpu ${
        isDragging ? `z-[${ZIndexEnums.CRM_SIDE_PANEL}] shadow-lg` : ""
      }`}
    >
      <DealCard
        id={String(deal.id)}
        title={deal.name}
        contactName={deal.contact.name}
        companyName={deal.company?.name}
        owner={deal.owner}
        amount={deal.amount ?? ""}
        priority={deal.priority}
        taskCount={deal.taskCount}
        onClick={() => onDealClick(String(deal.id))}
      />
    </div>
  );
};

export default DraggableDealCard;
