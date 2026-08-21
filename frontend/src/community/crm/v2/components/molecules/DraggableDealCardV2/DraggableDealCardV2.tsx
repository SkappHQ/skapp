import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC } from "react";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import DealCardV2 from "~community/crm/v2/components/molecules/DealCardV2/DealCardV2";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useResolvedBoardCard } from "~community/crm/v2/store/selectors";
import { CrmKanbanDragData } from "~community/crm/v2/types/CrmTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface DraggableDealCardV2Props {
  dealId: number;
  onDealClick: (dealId: number) => void;
}

const DraggableDealCardV2: FC<DraggableDealCardV2Props> = ({
  dealId,
  onDealClick
}) => {
  const { deal, owner, contact, company } = useResolvedBoardCard(dealId);

  const dragData: CrmKanbanDragData | undefined =
    deal?.stageId != null
      ? { type: "deal", stageId: deal.stageId }
      : undefined;

  const {
    setNodeRef,
    isDragging,
    attributes,
    listeners,
    transform,
    transition
  } = useSortable({ id: dealId, data: dragData });

  if (!deal) return null;

  return (
    <div
      ref={setNodeRef}
      id={String(dealId)}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.3 : 1,
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={`cursor-grab active:cursor-grabbing transform-gpu ${
        isDragging ? `z-[${ZIndexEnums.CRM_SIDE_PANEL}] shadow-lg` : ""
      }`}
    >
      <DealCardV2
        id={dealId}
        title={deal.name ?? ""}
        contactName={getContactDisplayName(contact)}
        companyName={company?.name}
        owner={owner}
        amount={deal.amount ?? ""}
        priority={deal.priority ?? CrmPriorityEnum.LOW}
        taskCount={deal.taskCount}
        onClick={() => onDealClick(dealId)}
      />
    </div>
  );
};

export default DraggableDealCardV2;
