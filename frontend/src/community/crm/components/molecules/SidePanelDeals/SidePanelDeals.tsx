import React from "react";

import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

export interface SidePanelDealItem {
  id: number;
  name: string;
  contactName: string;
  amount: string | null;
  currencyCode: string | null;
  stageName: string;
  stageColor: string;
  description: string | null;
}

const mapDealsToAccordionItems = (
  deals: SidePanelDealItem[],
  descriptionLabel: string
): AdvancedAccordionItem[] =>
  deals.map((deal) => ({
    id: String(deal.id),
    header: (
      <div className="flex flex-col gap-[2px]">
        <p className="body2 text-black">{deal.name}</p>
        <div className="flex items-center gap-2 text-secondary-text">
          <span className="body3">{deal.contactName}</span>
          {deal.amount && (
            <>
              <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
              <span className="body3">
                {deal.currencyCode
                  ? `${deal.amount} ${deal.currencyCode}`
                  : deal.amount}
              </span>
            </>
          )}
        </div>
      </div>
    ),
    badge: (
      <div className="flex items-center justify-center gap-2 rounded-full bg-tertiary-background px-3 py-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: deal.stageColor }}
        />
        <span className="body2 text-secondary-text">{deal.stageName}</span>
      </div>
    ),
    content: (
      <div className="flex flex-col gap-1">
        <p className="subtitle4 text-secondary-text">{descriptionLabel}</p>
        {deal.description ? (
          <p className="body3 text-black">{deal.description}</p>
        ) : (
          <Icon name={IconName.DASH_ICON} width="16" height="16" />
        )}
      </div>
    )
  }));

interface Props {
  deals: SidePanelDealItem[];
}

const SidePanelDeals: React.FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "sidePanelDeals");

  const handleAddDeal = () => {
    // TODO: Open the add deal side panel when clicked
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h2 className="h2 text-black">{translateText(["title"])}</h2>
      <hr className="border-gray-200" />
      {deals.length === 0 ? (
        <EmptyDataView
          icon={<SearchIcon width="24" height="24" />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={{
            text: translateText(["addDealBtn"]),
            variant: "tertiary",
            onClick: handleAddDeal
          }}
          className={{
            wrapper: "h-[228px]"
          }}
        />
      ) : (
        <div className="flex flex-col">
          <AdvancedAccordion
            items={mapDealsToAccordionItems(
              deals,
              translateText(["description"])
            )}
            allowMultiple={true}
            className="gap-4"
          />
          <ButtonV2
            variant="line"
            size="sm"
            onClick={handleAddDeal}
            className="self-start !px-3"
            icon={
              <Icon
                name={IconName.ADD_ICON}
                width="1rem"
                height="1rem"
                fill="currentColor"
              />
            }
            iconPosition="end"
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default SidePanelDeals;
