import { Chip } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { DefaultStageNameEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface DealAccordionItemBadgeProps {
  deal: CrmDealEntity;
}

const DealAccordionItemBadge: FC<DealAccordionItemBadgeProps> = ({ deal }) => {
  const translateText = useTranslator(
    "crmModule",
    "deals",
    "defaultStageNames"
  );

  const stages = useCrmStoreV2((store) => store.stages);

  if (deal.stageId !== undefined) {
    const stage = stages[deal.stageId];

    if (stage?.name !== undefined) {
      const stageName =
        stage.name in DefaultStageNameEnum
          ? translateText([stage.name])
          : stage.name;

      return (
        <Chip
          label={<StageLabel label={stageName} color={stage.color} />}
          size="sm"
        />
      );
    }
  }

  return null;
};

export default DealAccordionItemBadge;
