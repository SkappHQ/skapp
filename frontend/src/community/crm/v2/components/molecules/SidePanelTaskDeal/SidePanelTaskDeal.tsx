import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  Chip,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import StageLabel from "~community/crm/components/atoms/StageLabel/StageLabel";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { formatValue } from "~community/crm/utils/crmUtil";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getOwnerFullName } from "~community/crm/v2/utils/crmTaskUtils";

interface Props {
  dealId: number | undefined;
}

const SidePanelTaskDeal: FC<Props> = ({ dealId }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const translateTaskText = useTranslator("crmModule", "tasks", "sidePanel");

  const { getStageByName } = useStageNameMapper();

  const { deals, owners, stages } = useCrmStoreV2(
    useShallow((store) => ({
      deals: store.deals,
      owners: store.owners,
      stages: store.stages
    }))
  );

  const deal = dealId ? deals[dealId] : undefined;
  const owner = deal?.ownerId ? owners[deal?.ownerId] : undefined;
  const stage = deal?.stageId ? stages[deal.stageId] : undefined;

  if (!deal) {
    return (
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["emptyTitle"])}
        description={translateTaskText(["noDealsDescription"])}
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
            {translateText(["descriptionLabel"])}
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
