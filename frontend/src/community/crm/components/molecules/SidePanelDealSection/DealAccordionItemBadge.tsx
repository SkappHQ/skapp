import { Chip } from "@rootcodelabs/skapp-ui";
import React from "react";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
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
        style={{ backgroundColor: STAGE_COLOR_MAP[deal.stage.color] }}
      />
    }
  />
);

export default DealAccordionItemBadge;
