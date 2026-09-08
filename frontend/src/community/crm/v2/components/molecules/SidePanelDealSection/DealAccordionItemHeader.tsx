import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { concatStrings } from "~community/common/utils/commonUtil";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  formatMonetaryValueWithDecimals,
  formatTableValue
} from "~community/crm/v2/utils/commonUtil";

interface DealAccordionItemHeaderProps {
  deal: CrmDealEntity;
}

const DealAccordionItemHeader: FC<DealAccordionItemHeaderProps> = ({
  deal
}) => {
  const owners = useCrmStoreV2(useShallow((store) => store.owners));

  const owner = deal.ownerId !== undefined ? owners[deal.ownerId] : undefined;

  const ownerName =
    owner !== undefined
      ? concatStrings([owner.firstName, owner.lastName ?? ""]).trim()
      : undefined;

  const amount =
    deal.amount !== undefined && Number(deal.amount) > 0
      ? formatMonetaryValueWithDecimals(deal.amount)
      : undefined;

  return (
    <div className="flex flex-col gap-[2px]">
      <span className="body2">{deal.name}</span>
      <div className="flex items-center gap-2 text-secondary-text">
        <span className="body3">{formatTableValue(ownerName)}</span>
        {amount !== undefined && (
          <>
            <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
            <span className="body3">{amount}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DealAccordionItemHeader;
