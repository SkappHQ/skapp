import { FC, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import DealCardV2 from "~community/crm/v2/components/molecules/DealCardV2/DealCardV2";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { resolveBoardCard } from "~community/crm/v2/utils/boardUtil";

const BoardCardOverlay: FC<{ dealId: number }> = ({ dealId }) => {
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

  if (!deal) return null;

  return (
    <div className="w-69">
      <DealCardV2
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
