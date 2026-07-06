import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";
import DealStageLaneHeader from "~community/crm/components/molecules/DealStageLane/DealStageLaneHeader/DealStageLaneHeader";
import DraggableDealCard from "~community/crm/components/molecules/DraggableDealCard/DraggableDealCard";
import { useLoadMoreStageDeals } from "~community/crm/hooks/useLoadMoreStageDeals";
import type { CrmBoardDealSliceType } from "~community/crm/types/BoardTypes";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

export interface DealStageLaneProps {
  stage: CrmDealStageType;
  deals: CrmBoardDealSliceType[];
  isLoading: boolean;
  currentPage: number;
  hasNextPage: boolean;
  totalCount: number;
  isOver?: boolean;
  searchKeyword?: string;
  onDealClick: (dealId: number) => void;
  onAddDeal: (stageId: number) => void;
}

const DealStageLane: FC<DealStageLaneProps> = ({
  stage,
  deals,
  isLoading,
  currentPage,
  hasNextPage,
  totalCount,
  isOver = false,
  searchKeyword,
  onDealClick,
  onAddDeal
}) => {
  const translateText = useTranslator("crmModule", "deals", "kanban");

  const totalValue = formatValue(
    String(deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0))
  );

  const { handleLoadMore, isFetchingNextPage } = useLoadMoreStageDeals({
    stageId: stage.id,
    currentPage,
    searchKeyword
  });

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore: handleLoadMore
  });

  const dealIds = useMemo(() => deals.map((d) => d.id), [deals]);

  return (
    <DealStageLaneHeader
      stage={stage}
      totalValue={totalValue}
      totalCount={totalCount}
      isOver={isOver}
    >
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 h-full overflow-y-auto overflow-x-hidden px-3 pb-3">
        {isLoading ? (
          <DealCardSkeleton count={3} />
        ) : (
          <>
            <SortableContext
              items={dealIds}
              strategy={verticalListSortingStrategy}
            >
              {deals.map((deal) => (
                <DraggableDealCard
                  key={deal.id}
                  deal={deal}
                  onDealClick={onDealClick}
                />
              ))}
            </SortableContext>

            {hasNextPage && isFetchingNextPage && (
              <>
                <DealCardSkeleton count={2} />
                <div className="h-1 w-full" />
              </>
            )}

            <ButtonV2
              variant="line"
              type="button"
              isFullWidth
              size="sm"
              icon={<PlusIcon />}
              iconPosition="end"
              onClick={() => onAddDeal(stage.id)}
            >
              {translateText(["addDealBtn"])}
            </ButtonV2>
          </>
        )}
        <div ref={loadingRef} />
      </div>
    </DealStageLaneHeader>
  );
};

export default DealStageLane;
