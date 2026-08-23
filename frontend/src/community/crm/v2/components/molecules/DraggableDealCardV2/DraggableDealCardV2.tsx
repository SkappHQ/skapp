import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import DealCardV2 from "~community/crm/v2/components/molecules/DealCardV2/DealCardV2";
import { CrmKanbanDragType } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmKanbanDragData } from "~community/crm/v2/types/CrmTypes";
import { resolveBoardCard } from "~community/crm/v2/utils/boardUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface DraggableDealCardV2Props {
  dealId: number;
  onDealClick: (dealId: number) => void;
}

const DraggableDealCardV2: FC<DraggableDealCardV2Props> = ({
  dealId,
  onDealClick
}) => {
  const { deal, owners, contacts, companies } = useCrmStoreV2(
    useShallow((store) => ({
      deal: store.deals[dealId],
      owners: store.owners,
      contacts: store.contacts,
      companies: store.companies
    }))
  );

  const { owner, contact, company } = useMemo(
    () => resolveBoardCard(deal, owners, contacts, companies),
    [deal, owners, contacts, companies]
  );

  const dragData: CrmKanbanDragData | undefined =
    deal?.stageId != null
      ? { type: CrmKanbanDragType.DEAL, stageId: deal.stageId }
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
        priority={deal.priority}
        taskCount={deal.taskCount}
        onClick={() => onDealClick(dealId)}
      />
    </div>
  );
};

export default DraggableDealCardV2;
