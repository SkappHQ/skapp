import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import StageLabel from "~community/crm/components/atoms/StageLabel/StageLabel";
import { useStageNameMapper } from "~community/crm/hooks/useStageNameMapper";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealEntity } from "~community/crm/types/CrmCommonTypes";

interface DealAccordionItemBadgeProps {
  deal: CrmDealEntity;
}

const DealAccordionItemBadge: FC<DealAccordionItemBadgeProps> = ({ deal }) => {
  const { getStageByName } = useStageNameMapper();

  const { stages } = useCrmStore(
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
