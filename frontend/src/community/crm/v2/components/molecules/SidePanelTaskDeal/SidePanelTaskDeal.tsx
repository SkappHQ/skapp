import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  Chip,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { formatValue } from "~community/crm/utils/crmUtil";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import {
  CrmDealEntity,
  CrmOwnerEntity,
  CrmStageEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerFullName } from "~community/crm/v2/utils/taskUtil";

interface Props {
  deal?: CrmDealEntity;
  owner?: CrmOwnerEntity;
  stage?: CrmStageEntity;
}

const SidePanelTaskDeal: FC<Props> = ({ deal, owner, stage }) => {
  const translateText = useTranslator("crmModule", "tasks", "sidePanel");

  const { getStageByName } = useStageNameMapper();

  if (!deal) {
    return (
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["noDealsTitle"])}
        description={translateText(["noDealsDescription"])}
        className={{
          wrapper: "h-[228px] bg-secondary-background rounded-lg"
        }}
      />
    );
  }

  const accordionItems: AdvancedAccordionItem[] = [
    {
      id: String(deal.id),
      header: (
        <div className="flex flex-col gap-[2px]">
          <span className="body2">{deal.name}</span>
          <div className="flex items-center gap-2 text-secondary-text">
            <span className="body3">{getOwnerFullName(owner)}</span>
            {deal.amount && (
              <>
                <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
                <span className="body3">{formatValue(deal.amount)}</span>
              </>
            )}
          </div>
        </div>
      ),
      badge: stage?.color && (
        <Chip
          label={
            <StageLabel
              label={getStageByName(stage.name ?? "")}
              color={stage.color}
            />
          }
          size="sm"
        />
      ),
      content: (
        <div className="flex flex-col gap-1">
          <p className="subtitle4 text-secondary-text">
            {translateText(["dealDescriptionLabel"])}
          </p>
          {deal.description ? (
            <p className="body3">{deal.description}</p>
          ) : (
            <span className="body3">-</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full gap-2">
      <AdvancedAccordion
        items={accordionItems}
        allowMultiple={true}
        className="gap-4"
      />
    </div>
  );
};

export default SidePanelTaskDeal;
