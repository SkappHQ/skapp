import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";
import DealStageLaneHeader from "~community/crm/components/molecules/DealStageLane/DealStageLaneHeader/DealStageLaneHeader";
import DraggableDealCard from "~community/crm/components/molecules/DraggableDealCard/DraggableDealCard";
import type { CrmBoardDealType } from "~community/crm/types/BoardTypes";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

export interface DealStageLaneProps {
  stage: CrmDealStageType;
  deals: CrmBoardDealType[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isOver?: boolean;
  onDealClick: (dealId: number) => void;
  onAddDeal: (stageId: number) => void;
  onLoadMore: () => void;
}

const DealStageLane: FC<DealStageLaneProps> = ({
  stage,
  deals,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isOver = false,
  onDealClick,
  onAddDeal,
  onLoadMore
}) => {
  const translateText = useTranslator("crmModule", "deals", "kanban");

  const totalValue = formatValue(
    String(deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0))
  );

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isFetchingNextPage,
    onLoadMore
  });

  return (
    <DealStageLaneHeader
      stage={stage}
      totalValue={totalValue}
      totalCount={deals.length}
      isOver={isOver}
    >
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 pb-3">
        {isLoading ? (
          <DealCardSkeleton count={3} />
        ) : (
          <>
            <SortableContext
              items={deals.map((d) => d.id)}
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
