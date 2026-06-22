import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import { CrmDealBoardType } from "~community/crm/types/CommonTypes";

interface DraggableDealCardProps {
  deal: CrmDealBoardType;
  onDealClick?: (dealId: string) => void;
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
  } = useSortable({ id: deal.id, data: { type: "deal", deal } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
      }}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transform-gpu ${
        isDragging ? "z-50 shadow-lg" : ""
      }`}
      id={String(deal.id)}
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
        isInteractive={!isDragging}
        onClick={onDealClick ? () => onDealClick(String(deal.id)) : undefined}
      />
    </div>
  );
};

export default DraggableDealCard;
