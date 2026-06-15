import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  useGetBoardInitData,
  useGetDealsGrouped,
  useLoadMoreDeals,
  useMoveBetweenStages,
  useReorderWithinStage,
} from "~community/crm/api/BoardApi";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import type { DealStageLaneDeal } from "~community/crm/components/molecules/DealStageLane";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import type {
  BoardDealItem,
  BoardStageDeals,
  CrmDealStageType,
} from "~community/crm/types/CommonTypes";

// --- Constants ---

const PAGE_LIMIT = 10;

const STAGE_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-400",
  orange: "bg-orange-400",
  amber: "bg-amber-400",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  pink: "bg-pink-400",
  indigo: "bg-indigo-400",
};

// --- Helpers ---

const formatCurrency = (value: number | string | null | undefined): string => {
  const num = typeof value === "string" ? Number.parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isNaN(num) ? 0 : num);
};

const getAccentClass = (color: string): string =>
  STAGE_COLOR_MAP[color?.toLowerCase()] ?? "bg-zinc-400";

const toDealPriority = (p: CrmPriorityEnum | null): CrmPriorityEnum =>
  p ?? CrmPriorityEnum.LOW;

const toStageLaneDeal = (deal: BoardDealItem): DealStageLaneDeal => ({
  id: String(deal.id),
  title: deal.name,
  contactName: deal.contactName ?? undefined,
  company: deal.companyName ?? '',
  assignee: deal.ownerId
    ? {
        id: String(deal.ownerId),
        firstName: deal.ownerFirstName ?? undefined,
        lastName: deal.ownerLastName ?? undefined,
        src: deal.ownerAuthPic ?? undefined,
      }
    : undefined,
  formattedValue: formatCurrency(deal.amount),
  priority: toDealPriority(deal.priority),
  taskCount: deal.taskCount,
  taskCountTooltip: `${deal.taskCount} task${deal.taskCount === 1 ? '' : 's'}`,
  ariaLabel: `Deal: ${deal.name}`,
});

// --- Per-stage state ---

interface StageState {
  deals: BoardDealItem[];
  totalCount: number;
  page: number;
  isLoadingMore: boolean;
}

const buildInitialStageState = (
  data: BoardStageDeals[]
): Record<number, StageState> =>
  Object.fromEntries(
    data.map((s) => [
      s.stageId,
      { deals: s.deals, totalCount: s.totalCount, page: 0, isLoadingMore: false },
    ])
  );

// --- Main component ---

const DealsKanbanBoard: React.FC = () => {
  const searchKeyword = '';

  // Init data
  const { data: initData, isLoading: isInitLoading } = useGetBoardInitData();
  const stages: CrmDealStageType[] = initData?.stages ?? [];
  const stageIds = stages.map((s) => s.id);

  // Grouped deals query
  const { data: groupedData, isLoading: isDealsLoading } = useGetDealsGrouped(
    stageIds,
    searchKeyword,
    stageIds.length > 0
  );

  // Per-stage optimistic state
  const [stageMap, setStageMap] = useState<Record<number, StageState>>({});

  useEffect(() => {
    if (groupedData) {
      setStageMap(buildInitialStageState(groupedData));
    }
  }, [groupedData]);

  const stageMapRef = useRef(stageMap);
  stageMapRef.current = stageMap;

  // DnD state
  const [activeDeal, setActiveDeal] = useState<BoardDealItem | null>(null);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);
  // Track the stage the drag started from — never mutated during the drag
  const originalStageIdRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Optimistic rollback snapshot
  const snapshotRef = useRef<Record<number, StageState> | null>(null);
  const revertToSnapshot = useCallback(() => {
    if (snapshotRef.current) setStageMap(snapshotRef.current);
  }, []);

  const { mutate: reorderWithinStage } = useReorderWithinStage(revertToSnapshot);
  const { mutate: moveBetweenStages } = useMoveBetweenStages(revertToSnapshot);

  // Load more
  const { mutate: loadMore } = useLoadMoreDeals((data) => {
    setStageMap((prev) => {
      const existing = prev[data.stageId];
      if (!existing) return prev;
      return {
        ...prev,
        [data.stageId]: {
          ...existing,
          deals: [...existing.deals, ...data.deals],
          totalCount: data.totalCount,
          page: existing.page + 1,
          isLoadingMore: false,
        },
      };
    });
  });

  const handleLoadMore = (stageIdStr: string) => {
    const stageId = Number(stageIdStr);
    const s = stageMapRef.current[stageId];
    if (!s || s.isLoadingMore) return;
    setStageMap((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], isLoadingMore: true },
    }));
    loadMore({
      stageIds: [stageId],
      searchKeyword: searchKeyword || undefined,
      page: s.page + 1,
      limit: PAGE_LIMIT,
    });
  };

  // Drag handlers
  const handleDragStart = ({ active }: DragStartEvent) => {
    const dealId = Number(active.id);
    for (const [sid, state] of Object.entries(stageMapRef.current)) {
      const found = state.deals.find((d) => d.id === dealId);
      if (found) {
        setActiveDeal(found);
        setActiveStageId(Number(sid));
        originalStageIdRef.current = Number(sid); // lock in source stage
        break;
      }
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      setOverStageId(null);
      return;
    }

    const overId = String(over.id);
    const targetStageId = overId.startsWith("stage::")
      ? Number(overId.replace("stage::", ''))
      : (() => {
          const overDealId = Number(overId);
          for (const [sid, state] of Object.entries(stageMapRef.current)) {
            if (state.deals.some((d) => d.id === overDealId)) return Number(sid);
          }
          return null;
        })();

    setOverStageId(targetStageId);

    const activeDealId = Number(active.id);
    if (!targetStageId || !activeStageId || activeStageId === targetStageId) return;

    // Optimistic cross-column move — insert at the hovered position
    setStageMap((prev) => {
      const srcState = prev[activeStageId];
      const tgtState = prev[targetStageId];
      if (!srcState || !tgtState) return prev;

      const deal = srcState.deals.find((d) => d.id === activeDealId);
      if (!deal) return prev;

      // Remove from source (or re-remove if already moved on a previous DragOver)
      const srcDeals = srcState.deals.filter((d) => d.id !== activeDealId);

      // Determine insertion index in the target column
      let tgtDeals = tgtState.deals.filter((d) => d.id !== activeDealId); // remove if already there
      if (overId.startsWith("stage::")) {
        // Dropped on empty-column drop zone — append to end
        tgtDeals = [...tgtDeals, deal];
      } else {
        const overDealId = Number(overId);
        const overIndex = tgtDeals.findIndex((d) => d.id === overDealId);
        if (overIndex === -1) {
          tgtDeals = [...tgtDeals, deal];
        } else {
          tgtDeals = [
            ...tgtDeals.slice(0, overIndex),
            deal,
            ...tgtDeals.slice(overIndex),
          ];
        }
      }

      return {
        ...prev,
        [activeStageId]: {
          ...srcState,
          deals: srcDeals,
          totalCount: Math.max(0, srcState.totalCount - 1),
        },
        [targetStageId]: {
          ...tgtState,
          deals: tgtDeals,
          totalCount: tgtState.totalCount + (tgtState.deals.some((d) => d.id === activeDealId) ? 0 : 1),
        },
      };
    });
    setActiveStageId(targetStageId);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeDealId = Number(active.id);
    const finalStageId = activeStageId;       // current (possibly new) stage
    const sourceStageId = originalStageIdRef.current; // where the drag started

    setActiveDeal(null);
    setActiveStageId(null);
    setOverStageId(null);
    originalStageIdRef.current = null;

    if (!over || !finalStageId || !sourceStageId) return;

    snapshotRef.current = { ...stageMapRef.current };

    const isCrossStage = sourceStageId !== finalStageId;
    const targetDeals = stageMapRef.current[finalStageId]?.deals ?? [];
    const activeIndex = targetDeals.findIndex((d) => d.id === activeDealId);
    if (activeIndex === -1) return;

    if (isCrossStage) {
      // handleDragOver already inserted the deal at the correct position in
      // the target column (live preview). targetDeals reflects the final order,
      // so neighbours are simply the adjacent items around activeIndex.
      moveBetweenStages({
        dealId: activeDealId,
        newStageId: finalStageId,
        previousDealId: targetDeals[activeIndex - 1]?.id ?? null,
        nextDealId: targetDeals[activeIndex + 1]?.id ?? null,
      });
      return;
    }

    // Same-stage reorder
    const overId = String(over.id);
    if (overId.startsWith("stage::")) return; // dropped back on same column header — no change

    const overDealId = Number(overId);
    const overIndex = targetDeals.findIndex((d) => d.id === overDealId);
    if (overIndex === -1 || activeIndex === overIndex) return;

    const reordered = arrayMove(targetDeals, activeIndex, overIndex);
    setStageMap((prev) => ({
      ...prev,
      [finalStageId]: { ...prev[finalStageId], deals: reordered },
    }));

    reorderWithinStage({
      dealId: activeDealId,
      previousDealId: reordered[overIndex - 1]?.id ?? null,
      nextDealId: reordered[overIndex + 1]?.id ?? null,
    });
  };

  const handleDragCancel = () => {
    setActiveDeal(null);
    setActiveStageId(null);
    setOverStageId(null);
    originalStageIdRef.current = null;
  };

  const isInitialLoad = isInitLoading || (stageIds.length > 0 && isDealsLoading);

  return (
    <main className="flex h-screen flex-col bg-white p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden py-2">
          {stages.map((stage) => {
            const state = stageMap[stage.id];
            const deals = state?.deals ?? [];
            const totalCount = state?.totalCount ?? 0;
            const totalValue = deals.reduce(
              (sum, d) => sum + (Number.parseFloat(String(d.amount ?? "0")) || 0),
              0
            );
            const hasMore = deals.length < totalCount;

            return (
              <DealStageLane
                key={stage.id}
                stage={{
                  id: String(stage.id),
                  name: stage.name,
                  accentClass: getAccentClass(stage.color),
                  formattedTotal: formatCurrency(totalValue),
                  totalCount,
                }}
                deals={deals.map(toStageLaneDeal)}
                isLoading={isInitialLoad}
                hasMore={hasMore}
                isLoadingMore={state?.isLoadingMore ?? false}
                isOver={overStageId === stage.id}
                onDealClick={() => {}}
                onLoadMore={handleLoadMore}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeDeal && (
            <div className="w-74 rotate-1 opacity-95 shadow-2xl">
              <DealCard
                id={String(activeDeal.id)}
                title={activeDeal.name}
                contactName={activeDeal.contactName ?? undefined}
                company={activeDeal.companyName ?? ''}
                assignee={
                  activeDeal.ownerId
                    ? {
                        id: String(activeDeal.ownerId),
                        firstName: activeDeal.ownerFirstName ?? undefined,
                        lastName: activeDeal.ownerLastName ?? undefined,
                        src: activeDeal.ownerAuthPic ?? undefined,
                      }
                    : undefined
                }
                formattedValue={formatCurrency(activeDeal.amount)}
                priority={toDealPriority(activeDeal.priority)}
                taskCount={activeDeal.taskCount}
                isInteractive={false}
                ariaLabel={activeDeal.name}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </main>
  );
};

export default DealsKanbanBoard;

