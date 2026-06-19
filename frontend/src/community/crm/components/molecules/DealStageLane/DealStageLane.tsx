import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useEffect, useRef } from "react";

import type {
  DealCardOwner,
  DealPriority
} from "~community/crm/components/molecules/DealCard/DealCard";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";

export interface DealStageLaneDeal {
  id: string;
  title: string;
  contactName?: string;
  company: string;
  owner?:   DealCardOwner;
  formattedValue: string;
  priority: DealPriority;
  taskCount?: number;
  taskCountTooltip?: string;
  ariaLabel?: string;
}

export interface DealStage {
  id: string;
  name: string;
  accentColor: string;
  formattedTotal: string;
  totalCount?: number;
}

export interface DealStageLaneProps {
  stage: DealStage;
  deals: DealStageLaneDeal[];
  isLoading?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isOver?: boolean;
  onDealClick?: (dealId: string) => void;
  onAddDeal?: (stageId: string) => void;
  onLoadMore?: (stageId: string) => void;
}

interface SortableItemProps {
  deal: DealStageLaneDeal;
  onDealClick?: (dealId: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ deal, onDealClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id, data: { type: "deal" } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1
      }}
      {...attributes}
      {...listeners}
    >
      <DealCard
        id={deal.id}
        title={deal.title}
        contactName={deal.contactName}
        company={deal.company}
        owner={deal.owner}
        formattedValue={deal.formattedValue}
        priority={deal.priority}
        taskCount={deal.taskCount}
        ariaLabel={deal.ariaLabel}
        isInteractive
        onClick={onDealClick ? () => onDealClick(deal.id) : undefined}
      />
    </div>
  );
};

const DealStageLane: React.FC<DealStageLaneProps> = ({
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
  const { setNodeRef } = useDroppable({
    id: `stage::${stage.id}`,
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
      className={[
        "flex h-full w-[320px] shrink-0 flex-col rounded-lg bg-tertiary-background outline-1 transition-shadow",
        isOver
          ? "outline-blue-400 ring-2 ring-blue-200"
          : "outline-secondary-accent"
      ].join(" ")}
      aria-labelledby={`crm-stage-${stage.id}`}
    >
      <div
        className="h-1.5 rounded-t-lg"
        style={{ backgroundColor: stage.accentColor }}
      />

      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <h2
            id={`crm-stage-${stage.id}`}
            className="subtitle1 truncate capitalize text-zinc-950"
          >
            {stage.name}
          </h2>
          <p className="body3 mt-0.5 text-zinc-500">{stage.formattedTotal}</p>
        </div>
        <span className="rounded-full bg-secondary-accent px-3 py-1 text-xs font-semibold text-zinc-600">
          {isLoading
            ? "…"
            : String(stage.totalCount ?? deals.length).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 pb-3">
        {isLoading ? (
          <>
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
          </>
        ) : (
          <>
            <SortableContext
              items={deals.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {deals.map((deal) => (
                <SortableItem
                  key={deal.id}
                  deal={deal}
                  onDealClick={onDealClick}
                />
              ))}
            </SortableContext>

            {deals.length === 0 && onAddDeal ? (
              <button
                type="button"
                onClick={() => onAddDeal(stage.id)}
                className="body3 w-full rounded-lg px-4 py-2 text-center font-medium text-zinc-500 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add deal +
              </button>
            ) : (
              <>
                {hasMore && (
                  <>
                    {isLoadingMore && (
                      <>
                        <DealCardSkeleton />
                        <DealCardSkeleton />
                      </>
                    )}
                    <div ref={sentinelRef} className="h-1 w-full" />
                  </>
                )}

                {onAddDeal && (
                  <button
                    type="button"
                    onClick={() => onAddDeal(stage.id)}
                    className="body3 mt-1 w-full rounded-lg px-4 py-2 text-center font-medium text-zinc-500 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add deal +
                  </button>
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
