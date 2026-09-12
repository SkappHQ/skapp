import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  PlusIcon,
  SearchIcon
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
  onDealCreated?: (deal: CrmDealEntity) => void;
  companyId?: number | null;
  defaultContact?: CrmContactEntity;
  showAddDealAction?: boolean;
  emptyDescription?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

const SidePanelDealSection: FC<SidePanelDealSectionProps> = ({
  dealIds,
  onDealCreated,
  companyId,
  defaultContact,
  showAddDealAction = true,
  emptyDescription,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const [isAddingDeal, setIsAddingDeal] = useState(false);

  const { deals } = useCrmStoreV2(
    useShallow((state) => ({ deals: state.deals }))
  );

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: onFetchNextPage
  });

  const handleAddDeal = () => {
    guardCrmCreate(CrmLimitResource.DEALS, () => setIsAddingDeal(true));
  };

  const handleCloseAddDeal = () => setIsAddingDeal(false);

  const handleDealCreated = (deal: CrmDealEntity) => onDealCreated?.(deal);

  const renderAddDealAction = () => {
    if (isAddingDeal) {
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          onDealCreated={handleDealCreated}
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
    if (dealIds?.length) {
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
          {showAddDealAction && (
            <div className="mt-2">{renderAddDealAction()}</div>
          )}
          <div ref={loadingRef} />
        </div>
      );
    }

    if (showAddDealAction && isAddingDeal) {
      return (
        <SidePanelAddDeal
          onClose={handleCloseAddDeal}
          onDealCreated={handleDealCreated}
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
