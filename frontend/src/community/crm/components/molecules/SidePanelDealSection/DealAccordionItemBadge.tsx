import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import StageLabel from "~community/crm/components/atoms/StageLabel/StageLabel";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";

interface Props {
  deal: DetailPanelDealResponseType;
}

const DealAccordionItemBadge: FC<Props> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  const stageName = getStageByName(deal?.stage?.name);

  return (
    <Chip
      label={<StageLabel label={stageName} color={deal?.stage?.color} />}
      size="sm"
    />
  );
};

export default DealAccordionItemBadge;
