import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";

interface Props {
  deal: DetailPanelDealResponseType;
}

const DealAccordionItemBadge: FC<Props> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  return (
    <Chip
      label={getStageByName(deal?.stage?.name)}
      showTooltip={true}
      size="sm"
      prefixIcon={
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: STAGE_COLOR_MAP[deal?.stage?.color] }}
        />
      }
    />
  );
};

export default DealAccordionItemBadge;
