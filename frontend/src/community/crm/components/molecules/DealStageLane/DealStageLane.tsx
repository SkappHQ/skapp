import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useRef } from "react";

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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isOver?: boolean;
  onDealClick: (dealId: string) => void;
  onAddDeal: (stageId: string) => void;
  onLoadMore?: (stageId: string) => void;
}

const DealStageLane: FC<DealStageLaneProps> = ({
  stage,
  deals,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  isOver = false,
  onDealClick,
  onAddDeal,
  onLoadMore
}) => {
  const translateText = useTranslator("crmModule", "deals", "kanban");

  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: "stage", stageId: stage.id }
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore(stage.id);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, stage.id]);

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
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-secondary-text">
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

            {deals.length === 0 && onAddDeal ? (
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
                {hasMore && (
                  <>
                    {isLoadingMore &&
                      Array.from({ length: 2 }).map((_, index) => (
                        <DealCardSkeleton key={index} />
                      ))}
                    <div ref={sentinelRef} className="h-1 w-full" />
                  </>
                )}

                {onAddDeal && (
                  <ButtonV2
                    variant="line"
                    type="button"
                    isFullWidth
                    size="sm"
                    onClick={() => onAddDeal(stage.id)}
                  >
                    {translateText(["addDealBtn"])}
                  </ButtonV2>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DealStageLane;
