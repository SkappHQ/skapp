import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import StageDot from "~community/crm/components/atoms/StageDot/StageDot";
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
      label={stageName}
      showTooltip
      size="sm"
      prefixIcon={<StageDot color={deal?.stage?.color} />}
    />
  );
};

export default DealAccordionItemBadge;
