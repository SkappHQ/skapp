import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelAddDeal from "~community/crm/components/molecules/SidePanelAddDeal/SidePanelAddDeal";
import { DetailPanelDealResponseType } from "~community/crm/types/CommonTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";

interface Props {
  deals: DetailPanelDealResponseType[];
}

const SidePanelDealSection: FC<Props> = ({ deals }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const [isAddingDeal, setIsAddingDeal] = useState(false);

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () => {
      setIsAddingDeal(true);
    });
  };

  const handleCloseAddDeal = () => {
    setIsAddingDeal(false);
  };

  const accordionItems: AdvancedAccordionItem[] = deals.map((deal) => ({
    id: String(deal.id),
    header: <DealAccordionItemHeader deal={deal} />,
    badge: <DealAccordionItemBadge deal={deal} />,
    content: <DealAccordionItemContent deal={deal} />
  }));

  const renderAddDealAction = () => {
    if (isAddingDeal) {
      return <SidePanelAddDeal onClose={handleCloseAddDeal} />;
    }

    return (
      <ButtonV2
        variant="line"
        size="sm"
        onClick={handleAddDeal}
        disabled={isCheckingCrmLimit}
        isLoading={isCheckingCrmLimit}
        aria-label={translateText(["ariaLabels", "addDealBtn"])}
        icon={<PlusIcon />}
        iconPosition="end"
      >
        {translateText(["addDealBtn"])}
      </ButtonV2>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {hasDeals ? (
        <div className="flex flex-col w-full">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
          <div className="mt-2">{renderAddDealAction()}</div>
        </div>
      ) : isAddingDeal ? (
        <SidePanelAddDeal onClose={handleCloseAddDeal} />
      ) : (
        <EmptyDataView
          icon={<SearchIcon />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={{
            children: translateText(["addDealBtn"]),
            variant: "tertiary",
            onClick: handleAddDeal,
            disabled: isCheckingCrmLimit,
            isLoading: isCheckingCrmLimit,
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

export default SidePanelDealSection;
