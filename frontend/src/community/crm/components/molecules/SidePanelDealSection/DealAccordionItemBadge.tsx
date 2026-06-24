import { Chip } from "@rootcodelabs/skapp-ui";
import React from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";

interface Props {
  deal: CrmDealListItem;
}

const DealAccordionItemBadge: React.FC<Props> = ({ deal }) => (
  <Chip
    label={deal.stageName}
    size="sm"
    prefixIcon={
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: STAGE_COLOR_MAP[deal.stageColor] }}
      />
    }
  />
);

export default DealAccordionItemBadge;
