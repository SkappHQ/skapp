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
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { FC, useEffect, useRef, useState } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type {
  BoardDealsGroupedRequest,
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

import { MOCK_DEALS, MOCK_STAGES } from "./mockData";

const PAGE_LIMIT = 10;

const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

const resolveTargetStageId = (
  overId: string,
  stageMap: Record<number, StageState>
): number | null => {
  if (overId) return Number(overId);
  const overDealId = Number(overId);
  for (const [sid, state] of Object.entries(stageMap)) {
    if (state.deals.some((d) => d.id === overDealId)) return Number(sid);
  }
  return null;
};

const computeInsertIndex = (
  overId: string,
  tgtDeals: CrmDealBoardType[],
  activeMidY: number,
  overMidY: number
): number => {
  if (overId) return tgtDeals.length;
  const overDealId = Number(overId);
  const overIndex = tgtDeals.findIndex((d) => d.id === overDealId);
  if (overIndex === -1) return tgtDeals.length;
  return activeMidY > overMidY ? overIndex + 1 : overIndex;
};

interface CrossStageMoveParams {
  activeDealId: number;
  deal: CrmDealBoardType;
  overId: string;
  sourceStageId: number;
  targetStageId: number;
  srcState: StageState;
  tgtState: StageState;
  activeMidY: number;
  overMidY: number;
  setStageMap: (
    fn: (prev: Record<number, StageState>) => Record<number, StageState>
  ) => void;
  moveBetweenStages: (payload: BoardMoveBetweenStagesPayload) => void;
}

const commitCrossStageMove = ({
  activeDealId,
  deal,
  overId,
  sourceStageId,
  targetStageId,
  srcState,
  tgtState,
  activeMidY,
  overMidY,
  setStageMap,
  moveBetweenStages
}: CrossStageMoveParams) => {
  const tgtDeals = tgtState.deals.filter((d) => d.id !== activeDealId);
  const insertIndex = computeInsertIndex(
    overId,
    tgtDeals,
    activeMidY,
    overMidY
  );
  const newTgtDeals = [
    ...tgtDeals.slice(0, insertIndex),
    deal,
    ...tgtDeals.slice(insertIndex)
  ];
  setStageMap((prev) => ({
    ...prev,
    [sourceStageId]: {
      ...prev[sourceStageId],
      deals: srcState.deals.filter((d) => d.id !== activeDealId),
      totalCount: Math.max(0, prev[sourceStageId].totalCount - 1)
    },
    [targetStageId]: {
      ...prev[targetStageId],
      deals: newTgtDeals,
      totalCount: prev[targetStageId].totalCount + 1
    }
  }));
  moveBetweenStages({
    dealId: activeDealId,
    newStageId: targetStageId,
    previousDealId: newTgtDeals[insertIndex - 1]?.id ?? null,
    nextDealId: newTgtDeals[insertIndex + 1]?.id ?? null
  });
};

interface SameStageReorderParams {
  activeDealId: number;
  sourceStageId: number;
  overId: string;
  srcDeals: CrmDealBoardType[];
  setStageMap: (
    fn: (prev: Record<number, StageState>) => Record<number, StageState>
  ) => void;
  reorderWithinStage: (payload: BoardReorderWithinStagePayload) => void;
}

const commitSameStageReorder = ({
  activeDealId,
  sourceStageId,
  overId,
  srcDeals,
  setStageMap,
  reorderWithinStage
}: SameStageReorderParams) => {
  if (overId) return;

  const overDealId = Number(overId);
  const activeIndex = srcDeals.findIndex((d) => d.id === activeDealId);
  const overIndex = srcDeals.findIndex((d) => d.id === overDealId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
    return;

  const reordered = arrayMove(srcDeals, activeIndex, overIndex);
  setStageMap((prev) => ({
    ...prev,
    [sourceStageId]: { ...prev[sourceStageId], deals: reordered }
  }));
  reorderWithinStage({
    dealId: activeDealId,
    previousDealId: reordered[overIndex - 1]?.id ?? null,
    nextDealId: reordered[overIndex + 1]?.id ?? null
  });
};

interface StageState {
  deals: CrmDealBoardType[];
  totalCount: number;
  page: number;
  isLoadingMore: boolean;
}

const buildInitialStageState = (
  data: Array<{
    stageId: number;
    deals: CrmDealBoardType[];
    totalCount: number;
  }>
): Record<number, StageState> =>
  Object.fromEntries(
    data.map((s) => [
      s.stageId,
      {
        deals: s.deals,
        totalCount: s.totalCount,
        page: 0,
        isLoadingMore: false
      }
    ])
  );

interface DealsKanbanBoardProps {
  searchKeyword?: string;
}

const DealsKanbanBoard: FC<DealsKanbanBoardProps> = ({
  searchKeyword = ""
}) => {
  // Replace mock data
  const stages: CrmDealStageType[] = MOCK_STAGES;
  const stageIds = stages.map((s) => s.id);
  const isInitLoading = false;
  const isDealsLoading = false;

  const [stageMap, setStageMap] = useState<Record<number, StageState>>({});

  useEffect(() => {
    const seedData: Array<{
      stageId: number;
      deals: CrmDealBoardType[];
      totalCount: number;
    }> = MOCK_STAGES.map((s) => ({
      stageId: s.id,
      deals: MOCK_DEALS[s.id] ?? [],
      totalCount: (MOCK_DEALS[s.id] ?? []).length
    }));
    setStageMap(buildInitialStageState(seedData));
  }, []);

  const stageMapRef = useRef(stageMap);
  stageMapRef.current = stageMap;

  const [activeDeal, setActiveDeal] = useState<CrmDealBoardType | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Replace stubs with useReorderWithinStage / useMoveBetweenStages / useLoadMoreDeals
  const reorderWithinStage = (_payload: BoardReorderWithinStagePayload) => {};
  const moveBetweenStages = (_payload: BoardMoveBetweenStagesPayload) => {};

  const loadMore = (_payload: BoardDealsGroupedRequest) => {};

  const handleLoadMore = (stageIdStr: string) => {
    const stageId = Number(stageIdStr);
    const s = stageMapRef.current[stageId];
    if (!s || s.isLoadingMore) return;
    const nextPage = s.page + 1;
    setStageMap((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], isLoadingMore: true }
    }));
    loadMore({
      stageIds: [stageId],
      searchKeyword: searchKeyword || undefined,
      page: nextPage,
      limit: PAGE_LIMIT
    });
    // Reset loading state and advance page (until real API is wired)
    setStageMap((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], isLoadingMore: false, page: nextPage }
    }));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const dealId = Number(active.id);
    for (const state of Object.values(stageMapRef.current)) {
      const found = state.deals.find((d) => d.id === dealId);
      if (found) {
        setActiveDeal(found);
        break;
      }
    }
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverStageId(
      over ? resolveTargetStageId(String(over.id), stageMapRef.current) : null
    );
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    setOverStageId(null);

    if (!over || !active) return;

    const activeDealId = Number(active.id);
    const overId = String(over.id);

    let sourceStageId = -1;
    for (const [sid, state] of Object.entries(stageMapRef.current)) {
      if (state.deals.some((d) => d.id === activeDealId)) {
        sourceStageId = Number(sid);
        break;
      }
    }
    if (sourceStageId === -1) return;
    const targetStageId = resolveTargetStageId(overId, stageMapRef.current);
    if (!targetStageId) return;

    const srcState = stageMapRef.current[sourceStageId];
    const tgtState = stageMapRef.current[targetStageId];
    if (!srcState || !tgtState) return;

    const deal = srcState.deals.find((d) => d.id === activeDealId);
    if (!deal) return;

    if (sourceStageId !== targetStageId) {
      commitCrossStageMove({
        activeDealId,
        deal,
        overId,
        sourceStageId,
        targetStageId,
        srcState,
        tgtState,
        activeMidY:
          (active.rect.current.translated?.top ?? 0) +
          (active.rect.current.translated?.height ?? 0) / 2,
        overMidY: over.rect.top + over.rect.height / 2,
        setStageMap,
        moveBetweenStages
      });
      return;
    }

    commitSameStageReorder({
      activeDealId,
      sourceStageId,
      overId,
      srcDeals: srcState.deals,
      setStageMap,
      reorderWithinStage
    });
  };

  const handleDragCancel = () => {
    setActiveDeal(null);
    setOverStageId(null);
  };

  const isInitialLoad =
    isInitLoading || (stageIds.length > 0 && isDealsLoading);

  return (
    <div className="flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto py-2 h-160 items-stretch">
          {stages.map((stage) => {
            const state = stageMap[stage.id];
            const deals = state?.deals ?? [];
            const totalCount = state?.totalCount ?? 0;
            const totalValue = deals.reduce(
              (sum, d) => sum + (Number.parseFloat(String(d.amount)) || 0),
              0
            );
            const hasMore = deals.length < totalCount;

            return (
              <DealStageLane
                key={stage.id}
                stage={{
                  id: String(stage.id),
                  name: stage.name,
                  accentColor: getAccentColor(stage.color),
                  totalValue: formatValue(String(totalValue)),
                  totalCount
                }}
                deals={deals}
                isLoading={isInitialLoad}
                hasMore={hasMore}
                isLoadingMore={state?.isLoadingMore ?? false}
                isOver={overStageId === stage.id}
                onDealClick={() => {}}
                onAddDeal={() => {}}
                onLoadMore={handleLoadMore}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="w-74 opacity-95">
              <DealCard
                id={String(activeDeal.id)}
                title={activeDeal.name}
                contactName={activeDeal.contact.name}
                companyName={activeDeal.company?.name}
                owner={activeDeal.owner}
                amount={activeDeal.amount ?? undefined}
                priority={activeDeal.priority}
                taskCount={activeDeal.taskCount}
                isInteractive={false}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DealsKanbanBoard;
