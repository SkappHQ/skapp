import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import { useCrmStore } from "~community/crm/store/store";
import { resolveBoardCard } from "~community/crm/utils/boardUtil";
import { getContactDisplayName } from "~community/crm/utils/contactUtil";

const BoardCardOverlay: FC<{ dealId: number }> = ({ dealId }) => {
  const { deal, owners, contacts, companies } = useCrmStore(
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

  if (!deal) return null;

  return (
    <div className="w-69">
      <DealCard
        id={dealId}
        title={deal.name ?? ""}
        contactName={getContactDisplayName(contact)}
        companyName={company?.name}
        owner={owner}
        amount={deal.amount ?? ""}
        priority={deal.priority}
        taskCount={deal.taskCount}
      />
    </div>
  );
};

export default BoardCardOverlay;
