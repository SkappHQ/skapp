import React from "react";

import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { SidePanelDealItem } from "~community/crm/types/CommonTypes";

const mapDealsToAccordionItems = (
  deals: SidePanelDealItem[],
  descriptionLabel: string
): AdvancedAccordionItem[] =>
  deals.map((deal) => ({
    id: String(deal.id),
    header: (
      <div className="flex flex-col gap-1">
        <p className="subtitle3 text-black">{deal.name}</p>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="body3">{deal.contactName}</span>
          {deal.amount && (
            <>
              <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
              <span className="body3">{`${deal.currencyCode ?? "$"}${deal.amount}`}</span>
            </>
          )}
        </div>
      </div>
    ),
    badge: (
      <div
        className="flex items-center justify-center gap-2 rounded-full bg-gray-100"
        style={{ width: "156px", height: "32px" }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: deal.stageColor }}
        />
        <span className="subtitle3 text-gray-700">{deal.stageName}</span>
      </div>
    ),
    content: deal.description ? (
      <div className="flex flex-col gap-1">
        <p className="subtitle4 text-gray-500">{descriptionLabel}</p>
        <p className="body3 text-black">{deal.description}</p>
      </div>
    ) : undefined
  }));

interface Props {
  deals: SidePanelDealItem[];
}

const SidePanelDeals: React.FC<Props> = ({ deals }) => {
  const { setIsAddDealFormOpen } = useCrmStore();
  const translateText = useTranslator("crmModule", "sidePanelDeals");

  const handleAddDeal = () => {
    setIsAddDealFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-black">{translateText(["title"])}</h2>
        <ButtonV2
          variant="tertiary"
          size="sm"
          onClick={handleAddDeal}
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
      <hr className="border-gray-200" />
      {deals.length === 0 ? (
        <div className="flex h-[228px] flex-col items-center justify-center gap-3 rounded-lg bg-gray-50">
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" fill="#71717A" />}
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{
              wrapper: "!h-auto !p-0 !gap-3"
            }}
          />
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-5 py-2 body3 font-medium text-black transition-colors hover:bg-gray-200"
            onClick={handleAddDeal}
          >
            {translateText(["addDealBtn"])}
            <PlusIcon />
          </button>
        </div>
      ) : (
        <AdvancedAccordion
          items={mapDealsToAccordionItems(
            deals,
            translateText(["description"])
          )}
          allowMultiple={true}
        />
      )}
    </div>
  );
};

export default SidePanelDeals;
