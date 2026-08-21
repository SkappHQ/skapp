import { FC } from "react";

import DealCardV2 from "~community/crm/v2/components/molecules/DealCardV2/DealCardV2";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useResolvedBoardCard } from "~community/crm/v2/store/selectors";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

const BoardCardOverlay: FC<{ dealId: number }> = ({ dealId }) => {
  const { deal, owner, contact, company } = useResolvedBoardCard(dealId);
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
        priority={deal.priority ?? CrmPriorityEnum.LOW}
        taskCount={deal.taskCount}
      />
    </div>
  );
};

export default BoardCardOverlay;
