import { FC } from "react";

import { concatStrings } from "~community/common/utils/commonUtil";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  formatMonetaryValueWithDecimals,
  getOwnerById
} from "~community/crm/v2/utils/commonUtil";

interface DealAccordionItemHeaderProps {
  deal: CrmDealEntity;
}

const DealAccordionItemHeader: FC<DealAccordionItemHeaderProps> = ({
  deal
}) => {
  const owners = useCrmStoreV2((store) => store.owners);

  const owner = getOwnerById(owners, deal.ownerId);

  return (
    <div className="flex flex-col gap-[2px]">
      <span className="body2">{deal.name}</span>
      <div className="flex items-center gap-2 text-secondary-text">
        <span className="body3">
          {owner &&
            concatStrings([owner.firstName, owner.lastName ?? ""]).trim()}
        </span>
        {deal.amount && (
          <>
            <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
            <span className="body3">
              {formatMonetaryValueWithDecimals(deal.amount)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default DealAccordionItemHeader;
