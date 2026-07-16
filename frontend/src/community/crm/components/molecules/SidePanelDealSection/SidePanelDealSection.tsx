import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import SidePanelAddDeal from "~community/crm/components/molecules/SidePanelAddDeal/SidePanelAddDeal";
import {
  CrmContactLookup,
  DetailPanelDealResponseType
} from "~community/crm/types/CommonTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";
import DealAccordionItemSkeleton from "./DealAccordionItemSkeleton";

interface Props {
  deals: DetailPanelDealResponseType[];
  defaultContact?: CrmContactLookup;
  showAddDealAction?: boolean;
  emptyDescription?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage: () => void;
}

const SidePanelDealSection: FC<Props> = ({
  deals,
  defaultContact,
  showAddDealAction = true,
  emptyDescription,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
  const hasDeals = deals.length > 0;
  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: onFetchNextPage
  });

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
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          defaultContact={defaultContact}
        />
      );
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

  const renderDealsContent = () => {
    if (hasDeals) {
      return (
        <div ref={loadingRef} className="flex flex-col w-full gap-2">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
          {isFetchingNextPage && <DealAccordionItemSkeleton />}
          {showAddDealAction && (
            <div className="mt-2">{renderAddDealAction()}</div>
          )}
        </div>
      );
    }

    if (showAddDealAction && isAddingDeal) {
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          defaultContact={defaultContact}
        />
      );
    }

    return (
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["emptyTitle"])}
        description={emptyDescription ?? translateText(["emptyDescription"])}
        button={
          showAddDealAction
            ? {
                children: translateText(["addDealBtn"]),
                variant: "tertiary",
                onClick: handleAddDeal,
                disabled: isCheckingCrmLimit,
                isLoading: isCheckingCrmLimit,
                icon: <PlusIcon />,
                "aria-label": translateText(["ariaLabels", "addDealBtn"])
              }
            : undefined
        }
        className={{
          wrapper: "h-[228px] bg-secondary-background rounded-lg"
        }}
      />
    );
  };

  return <div className="flex flex-col gap-4">{renderDealsContent()}</div>;
};

export default SidePanelDealSection;
