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
import SidePanelAddDeal from "~community/crm/v2/components/molecules/SidePanelAddDeal/SidePanelAddDeal";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmContactEntity,
  CrmDealEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import DealAccordionItemBadge from "./DealAccordionItemBadge";
import DealAccordionItemContent from "./DealAccordionItemContent";
import DealAccordionItemHeader from "./DealAccordionItemHeader";
import DealAccordionItemSkeleton from "./DealAccordionItemSkeleton";

interface SidePanelDealSectionProps {
  dealIds?: number[];
  onDealCreated: (deal: CrmDealEntity) => void;
  companyId?: number | null;
  defaultContact?: CrmContactEntity;
  emptyDescription?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

const SidePanelDealSection: FC<SidePanelDealSectionProps> = ({
  dealIds,
  onDealCreated,
  companyId,
  defaultContact,
  emptyDescription,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const [isAddingDeal, setIsAddingDeal] = useState(false);

  const deals = useCrmStoreV2((store) => store.deals);

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: () => onFetchNextPage?.()
  });

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () => setIsAddingDeal(true));
  };

  const handleCloseAddDeal = () => setIsAddingDeal(false);

  const renderAddDealAction = () => {
    if (isAddingDeal) {
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          onDealCreated={onDealCreated}
          companyId={companyId}
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
    if (dealIds !== undefined && dealIds.length > 0) {
      const accordionItems: AdvancedAccordionItem[] = dealIds.map((dealId) => {
        const deal = deals[dealId];

        return {
          id: String(dealId),
          header: <DealAccordionItemHeader deal={deal} />,
          badge: <DealAccordionItemBadge deal={deal} />,
          content: <DealAccordionItemContent deal={deal} />
        };
      });

      return (
        <div className="flex flex-col w-full gap-2">
          <AdvancedAccordion
            items={accordionItems}
            allowMultiple={true}
            className="gap-4"
          />
          {isFetchingNextPage && <DealAccordionItemSkeleton />}
          <div className="mt-2">{renderAddDealAction()}</div>
          <div ref={loadingRef} />
        </div>
      );
    }

    if (isAddingDeal) {
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          onDealCreated={onDealCreated}
          companyId={companyId}
          defaultContact={defaultContact}
        />
      );
    }

    return (
      <EmptyDataView
        icon={<SearchIcon />}
        title={translateText(["emptyTitle"])}
        description={emptyDescription ?? translateText(["emptyDescription"])}
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
    );
  };

  return <div className="flex flex-col gap-4">{renderDealsContent()}</div>;
};

export default SidePanelDealSection;
