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
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

export interface CompanyDealItem {
  id: number;
  name: string;
  contactName: string;
  amount: string | null;
  currencyCode: string | null;
  stageName: string;
  stageColor: string;
  description: string | null;
}

const mapDealsToAccordionItems = (deals: CompanyDealItem[]): AdvancedAccordionItem[] =>
  deals.map((deal) => ({
    id: String(deal.id),
    header: (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-black">{deal.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{deal.contactName}</span>
          {deal.amount && (
            <>
              <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
              <span>{`${deal.currencyCode ?? "$"}${deal.amount}`}</span>
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
        <span className="text-sm font-medium text-gray-700">
          {deal.stageName}
        </span>
      </div>
    ),
    content: deal.description ? (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-500">Description</p>
        <p className="text-xs text-black">{deal.description}</p>
      </div>
    ) : undefined
  }));

interface Props {
  deals: CompanyDealItem[];
}

const CompanyDeals: React.FC<Props> = ({ deals }) => {
  const { setIsAddDealFormOpen } = useCrmStore();

  const handleAddDeal = () => {
    setIsAddDealFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-black">Deals</h2>
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
          Add deal
        </ButtonV2>
      </div>
      <hr className="border-gray-200" />
      {deals.length === 0 ? (
        <div className="flex h-[228px] flex-col items-center justify-center gap-3 rounded-lg bg-gray-50">
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" fill="#71717A" />}
            title="No deals yet"
            description="Create your first deal to start tracking opportunities."
            className={{
              wrapper: "!h-auto !p-0 !gap-3"
            }}
          />
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-5 py-2 text-xs font-medium text-black transition-colors hover:bg-gray-200"
            onClick={handleAddDeal}
          >
            Add deal
            <PlusIcon />
          </button>
        </div>
      ) : (
        <AdvancedAccordion
          items={mapDealsToAccordionItems(deals)}
          allowMultiple={true}
        />
      )}
    </div>
  );
};

export default CompanyDeals;
