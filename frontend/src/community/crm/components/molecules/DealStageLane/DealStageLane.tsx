import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";
import DraggableDealCard from "~community/crm/components/molecules/DraggableDealCard/DraggableDealCard";
import { CrmDealBoardType } from "~community/crm/types/CommonTypes";

export interface SwimlaneDealStage {
  id: string;
  name: string;
  accentColor: string;
  totalValue: string;
  totalCount?: number;
}

export interface DealStageLaneProps {
  stage: SwimlaneDealStage;
  deals: CrmDealBoardType[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isOver?: boolean;
  onDealClick: (dealId: string) => void;
  onAddDeal: (stageId: string) => void;
  onLoadMore: (nextPage: number) => void;
}

const DealStageLane: FC<DealStageLaneProps> = ({
  stage,
  deals,
  isLoading = false,
  hasNextPage = false,
  isOver = false,
  onDealClick,
  onAddDeal,
  onLoadMore
}) => {
  const translateText = useTranslator("crmModule", "deals", "kanban");

  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: "stage", stageId: stage.id }
  });

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsLoadingMore(true);
    onLoadMore(nextPage);
    setIsLoadingMore(false);
  };

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full w-75 shrink-0 flex-col rounded-lg bg-tertiary-background outline-1 transition-shadow ${
        isOver
          ? "outline-primary-accent ring-2 ring-primary-background"
          : "outline-secondary-accent"
      }`}
      aria-labelledby={`crm-stage-${stage.id}`}
    >
      <div
        className="h-1.75 rounded-lg m-2"
        style={{ backgroundColor: stage.accentColor }}
      />

      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <h2
            id={`crm-stage-${stage.id}`}
            className="subtitle1 truncate capitalize"
          >
            {stage.name}
          </h2>
          <p className="body3 mt-0.5 text-secondary-icon">{stage.totalValue}</p>
        </div>
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full body3 bg-white px-1.5 text-secondary-text">
          {stage.totalCount}
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 pb-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <DealCardSkeleton key={index} />
          ))
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

            {deals.length === 0 ? (
              <ButtonV2
                variant="line"
                type="button"
                isFullWidth
                size="sm"
                onClick={() => onAddDeal(stage.id)}
              >
                {translateText(["addDealBtn"])}
              </ButtonV2>
            ) : (
              <>
                {hasNextPage && (
                  <>
                    {isLoadingMore &&
                      Array.from({ length: 2 }).map((_, index) => (
                        <DealCardSkeleton key={index} />
                      ))}
                    <div className="h-1 w-full" />
                  </>
                )}

                <ButtonV2
                  variant="line"
                  type="button"
                  isFullWidth
                  size="sm"
                  onClick={() => onAddDeal(stage.id)}
                >
                  {translateText(["addDealBtn"])}
                </ButtonV2>
              </>
            )}
          </>
        )}
        <div ref={loadingRef} />
      </div>
    </section>
  );
};

export default DealStageLane;
