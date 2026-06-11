import React from "react";

import { CrmDealType } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

interface Props {
  deal: CrmDealType;
}

const DealAccordionItemHeader: React.FC<Props> = ({ deal }) => (
  <div className="flex flex-col gap-[2px]">
    <span className="body2">{deal.name}</span>
    <div className="flex items-center gap-2 text-secondary-text">
      <span className="body3">{deal.contact.name}</span>
      {deal.amount && (
        <>
          <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
          <span className="body3">{formatValue(deal.amount)}</span>
        </>
      )}
    </div>
  </div>
);

export default DealAccordionItemHeader;
