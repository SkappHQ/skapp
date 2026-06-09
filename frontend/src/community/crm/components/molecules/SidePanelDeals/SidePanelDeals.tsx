import {
  AdvancedAccordion,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealType } from "~community/crm/types/CommonTypes";

import { mapDealsToAccordionItems } from "./mapDealsToAccordionItems";

interface Props {
  deals: CrmDealType[];
}

const SidePanelDeals: React.FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;

  const handleAddDeal = () => {
    // TODO: Open the add deal side panel when clicked
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h2 className="h2">{translateText(["title"])}</h2>
      <hr className="border-secondary-accent" />
      {hasDeals ? (
        <div className="flex flex-col items-start">
          <AdvancedAccordion
            items={mapDealsToAccordionItems(deals, translateText)}
            allowMultiple={true}
            className="gap-4"
          />
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
      ) : (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={{
            children: translateText(["addDealBtn"]),
            variant: "tertiary",
            onClick: handleAddDeal,
             icon: <PlusIcon />,
            "aria-label": translateText(["ariaLabels", "addDealBtn"])
           
          }}
          className={{
            wrapper: "h-[228px] bg-secondary-background rounded-lg"
          }}
        />
      )}
    </div>
  );
};

export default SidePanelDeals;
