import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

interface Props {
  deals: CrmDealType[];
}

const SidePanelDeals: React.FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;

  const handleAddDeal = () => {
    // TODO: Open the add deal side panel when clicked
  };

  const mapDealsToAccordionItems = (
    deals: CrmDealType[]
  ): AdvancedAccordionItem[] =>
    deals.map((deal) => ({
      id: String(deal.id),
      header: (
        <div className="flex flex-col gap-[2px]">
          <span className="body2">{deal.name}</span>
          <div className="flex items-center gap-2 text-secondary-text">
            <span className="body3">{deal.contact.name}</span>
            {deal.amount && (
              <>
                <span className="inline-block h-1 w-1 rounded-full bg-secondary-icon" />
                <span className="body3">
                  {formatValue(deal.amount)}
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
            style={{ backgroundColor: deal.stage.color }}
          />
          <span className="body2 text-secondary-text">{deal.stage.name}</span>
        </div>
      ),
      content: (
        <div className="flex flex-col gap-1">
          <p className="subtitle4 text-secondary-text">
            {translateText(["descriptionLabel"])}
          </p>
          {deal.description ? (
            <p className="body3">{deal.description}</p>
          ) : (
            <Icon name={IconName.DASH_ICON} />
          )}
        </div>
      )
    }));

  return (
    <div className="flex flex-col gap-4 mt-6">
      <h2 className="h2">{translateText(["title"])}</h2>
      <hr className="border-secondary-accent" />
      {hasDeals ? (
        <div className="flex flex-col">
          <AdvancedAccordion
            items={mapDealsToAccordionItems(deals)}
            allowMultiple={true}
            className="gap-4"
          />
          <ButtonV2
            variant="line"
            size="sm"
            onClick={handleAddDeal}
            className="self-start !px-3"
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
