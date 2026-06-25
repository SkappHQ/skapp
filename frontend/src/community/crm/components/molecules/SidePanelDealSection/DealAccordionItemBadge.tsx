import { Chip } from "@rootcodelabs/skapp-ui";
import React from "react";

import { pascalCaseFormatter } from "~community/common/utils/commonUtil";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";

interface Props {
  deal: DetailPanelDealResponseType;
}

const DealAccordionItemBadge: React.FC<Props> = ({ deal }) => (
  <Chip
    label={pascalCaseFormatter(deal.stage.name)}
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
