import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import type { DealCardFieldVisibility } from "~community/crm/components/molecules/DealCard/DealCard";
import type { DealStageLaneDeal } from "~community/crm/components/molecules/DealStageLane/DealStageLane";

interface DraggableDealCardProps {
  deal: DealStageLaneDeal;
  fieldVisibility?: DealCardFieldVisibility;
  onDealClick?: (dealId: string) => void;
}

const DraggableDealCard: FC<DraggableDealCardProps> = ({
  deal,
  fieldVisibility,
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
      id={deal.id}
    >
      <DealCard
        id={deal.id}
        title={deal.title}
        contactName={deal.contactName}
        company={deal.company}
        owner={deal.owner}
        dealAmount={deal.amount}
        priority={deal.priority}
        taskCount={deal.taskCount}
        fieldVisibility={fieldVisibility}
        ariaLabel={deal.ariaLabel}
        isInteractive={!isDragging}
        onClick={onDealClick ? () => onDealClick(deal.id) : undefined}
      />
    </div>
  );
};

export default DraggableDealCard;
