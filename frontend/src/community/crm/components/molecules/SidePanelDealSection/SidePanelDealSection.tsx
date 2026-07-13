import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";

interface Props {
  deals: DetailPanelDealResponseType[];
}

const SidePanelDealSection: FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;

  const accordionItems: AdvancedAccordionItem[] = deals.map((deal) => ({
    id: String(deal.id),
    header: <DealAccordionItemHeader deal={deal} />,
    badge: <DealAccordionItemBadge deal={deal} />,
    content: <DealAccordionItemContent deal={deal} />
  }));

  const renderDealsContent = () => {
    if (hasDeals) {
      return (
        <div className="flex flex-col w-full">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
        </div>
      );
    }

    return (
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["emptyTitle"])}
        description={translateText(["emptyDescription"])}
        className={{
          wrapper: "h-[228px] bg-secondary-background rounded-lg"
        }}
      />
    );
  };

  return <div className="flex flex-col gap-4">{renderDealsContent()}</div>;
};

export default SidePanelDealSection;
