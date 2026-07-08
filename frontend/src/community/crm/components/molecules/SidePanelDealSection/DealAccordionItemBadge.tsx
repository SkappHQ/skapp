import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";
import { getStageColorClass } from "~community/crm/utils/crmUtil";

interface Props {
  deal: DetailPanelDealResponseType;
}

const DealAccordionItemBadge: FC<Props> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  return (
    <Chip
      label={getStageByName(deal.stage.name)}
      size="sm"
      prefixIcon={
        <span
          className={`inline-block h-2 w-2 rounded-full ${getStageColorClass(deal.stage.color)}`}
        />
      }
    />
  );
};

export default DealAccordionItemBadge;
