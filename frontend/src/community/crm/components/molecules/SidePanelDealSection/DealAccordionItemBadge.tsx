import { Chip } from "@rootcodelabs/skapp-ui";
import React from "react";

import { CrmDealType } from "~community/crm/types/CommonTypes";

interface Props {
  deal: CrmDealType;
}

const DealAccordionItemBadge: React.FC<Props> = ({ deal }) => (
  <Chip
    label={deal.stage.name}
    size="sm"
    prefixIcon={
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: deal.stage.color }}
      />
    }
  />
);

export default DealAccordionItemBadge;
