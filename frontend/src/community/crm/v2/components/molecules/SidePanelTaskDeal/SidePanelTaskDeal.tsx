import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  Chip,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
// Presentational only - no store or v1 types, so these are reused as they are.
import StageLabel from "~community/crm/components/atoms/StageLabel/StageLabel";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { formatValue } from "~community/crm/utils/crmUtil";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { getOwnerFullName } from "~community/crm/v2/utils/crmTaskUtils";

interface Props {
  dealId: number | undefined;
}

/**
 * A task links to at most one deal, so this renders a single accordion item
 * rather than the paged list the company and contact side panels use. The
 * layout matches those panels so a deal reads the same wherever it appears.
 */
const SidePanelTaskDeal: FC<Props> = ({ dealId }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const translateTaskText = useTranslator("crmModule", "tasks", "sidePanel");

  const { getStageByName } = useStageNameMapper();

  const deal = useCrmStoreV2((state) =>
    dealId === undefined ? undefined : state.deals[dealId]
  );
  const owner = useCrmStoreV2((state) =>
    deal?.ownerId === undefined ? undefined : state.owners[deal.ownerId]
  );
  const stage = useCrmStoreV2((state) =>
    deal?.stageId === undefined ? undefined : state.stages[deal.stageId]
  );

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
