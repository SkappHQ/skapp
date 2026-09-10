import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface DealAccordionItemBadgeProps {
  deal: CrmDealEntity;
}

const DealAccordionItemBadge: FC<DealAccordionItemBadgeProps> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  const { stages } = useCrmStoreV2(
    useShallow((state) => ({ stages: state.stages }))
  );

  if (deal.stageId) {
    const stage = stages[deal.stageId];

    if (stage?.name) {
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
