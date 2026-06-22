import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";

interface Props {
  deals: DetailPanelDealResponseType[];
  showEmptyStateAddDeal?: boolean;
  emptyViewHeight?: string;
}

const SidePanelDealSection: React.FC<Props> = ({
  deals,
  showEmptyStateAddDeal = true,
  emptyViewHeight = "h-auto"
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;

  const handleAddDeal = () => {
    // Open the add deal side panel when clicked
  };

  const accordionItems: AdvancedAccordionItem[] = deals.map((deal) => ({
    id: String(deal.id),
    header: <DealAccordionItemHeader deal={deal} />,
    badge: <DealAccordionItemBadge deal={deal} />,
    content: <DealAccordionItemContent deal={deal} />
  }));

  return (
    <div className="flex flex-col gap-4">
      {hasDeals ? (
        <div className="flex flex-col w-full">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
          <div className="mt-2">
            <ButtonV2
              variant="line"
              size="sm"
              onClick={handleAddDeal}
              aria-label={translateText(["ariaLabels", "addDealBtn"])}
              icon={<PlusIcon />}
              iconPosition="end"
            >
              {translateText(["addDealBtn"])}
            </ButtonV2>
          </div>
        </div>
      ) : (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={
            showEmptyStateAddDeal
              ? {
                children: translateText(["addDealBtn"]),
                variant: "tertiary",
                onClick: handleAddDeal,
                icon: <PlusIcon />,
                "aria-label": translateText(["ariaLabels", "addDealBtn"])
              }
              : undefined
          }
          className={{
            wrapper: `${emptyViewHeight} bg-secondary-background rounded-lg`
          }}
        />
      )}
    </div>
  );
};

export default SidePanelDealSection;
