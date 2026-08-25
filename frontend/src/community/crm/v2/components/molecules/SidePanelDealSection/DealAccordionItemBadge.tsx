import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface DealAccordionItemBadgeProps {
  deal: CrmDealEntity;
}

const DealAccordionItemBadge: FC<DealAccordionItemBadgeProps> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  const stages = useCrmStoreV2((store) => store.stages);

  if (deal.stageId !== undefined) {
    const stage = stages[deal.stageId];

    if (stage?.name !== undefined) {
      return (
        <Chip
          label={
            <StageLabel
              label={getStageByName(stage.name)}
              color={stage.color}
            />
          }
          size="sm"
        />
      );
    }
  }

  return null;
};

export default DealAccordionItemBadge;
