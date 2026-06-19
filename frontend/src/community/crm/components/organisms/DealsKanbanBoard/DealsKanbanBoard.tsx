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
import React, { useEffect, useRef, useState } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane, {
  type DealStageLaneDeal
} from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import { CrmDealStageEnum, CrmPriorityEnum } from "~community/crm/enums/common";
import type {
  BoardDealItem,
  BoardDealsGroupedRequest,
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  BoardStageDeals,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

// --- Mock stages replace this ---
const MOCK_STAGES: CrmDealStageType[] = [
  {
    id: 1,
    name: "Lead",
    color: "PINK",
    orderIndex: 1,
    stageType: CrmDealStageEnum.INITIAL
  },
  {
    id: 2,
    name: "Qualified",
    color: "TEAL",
    orderIndex: 2,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 3,
    name: "Demo scheduled",
    color: "LAVENDER",
    orderIndex: 3,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 4,
    name: "Proposal sent",
    color: "GOLD",
    orderIndex: 4,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 5,
    name: "Deal Won",
    color: "LIME",
    orderIndex: 5,
    stageType: CrmDealStageEnum.WON
  },
  {
    id: 6,
    name: "Deal Lost",
    color: "ROSEWOOD",
    orderIndex: 6,
    stageType: CrmDealStageEnum.LOST
  }
];

const PAGE_LIMIT = 10;

const MOCK_OWNER = {
  employeeId: 1,
  firstName: "Alice",
  lastName: "Johnson",
  authPic: null
};

// moock deals grouped by stage (replace with api)
const MOCK_DEALS: Record<number, BoardDealItem[]> = {
  1: [
    {
      id: 101,
      name: "Acme Corp Expansion",
      contactName: "John Smith",
      companyName: "Acme Corp",
      owner: MOCK_OWNER,
      amount: "12000",
      priority: CrmPriorityEnum.HIGH,
      taskCount: 3,
      orderIndex: "1"
    },
    {
      id: 102,
      name: "Beta Solutions Onboarding",
      contactName: "Sara Lee",
      companyName: "Beta Solutions",
      owner: MOCK_OWNER,
      amount: "4500",
      priority: CrmPriorityEnum.LOW,
      taskCount: 1,
      orderIndex: "2"
    }
  ],
  2: [
    {
      id: 201,
      name: "Gamma Tech Upgrade",
      contactName: "Mike Chan",
      companyName: "Gamma Tech",
      owner: MOCK_OWNER,
      amount: "29000",
      priority: CrmPriorityEnum.MEDIUM,
      taskCount: 2,
      orderIndex: "1"
    }
  ],
  3: [
    {
      id: 301,
      name: "Delta Finance Suite",
      contactName: "Emma Brown",
      companyName: "Delta Finance",
      owner: MOCK_OWNER,
      amount: "55000",
      priority: CrmPriorityEnum.HIGH,
      taskCount: 5,
      orderIndex: "1"
    }
  ],
  4: [],
  5: [
    {
      id: 501,
      name: "Omega Retail Deal",
      contactName: "Tom White",
      companyName: "Omega Retail",
      owner: MOCK_OWNER,
      amount: "18000",
      priority: CrmPriorityEnum.MEDIUM,
      taskCount: 0,
      orderIndex: "1"
    }
  ],
  6: []
};

const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()] ?? "#a1a1aa";

const toStageLaneDeal = (deal: BoardDealItem): DealStageLaneDeal => ({
  id: String(deal.id),
  title: deal.name,
  contactName: deal.contactName ?? undefined,
  company: deal.companyName ?? "",
  owner: {
    id: String(deal.owner.employeeId),
    firstName: deal.owner.firstName,
    lastName: deal.owner.lastName ?? undefined,
    src: deal.owner.authPic ?? undefined
  },
  formattedValue: formatValue(deal.amount),
  priority: deal.priority,
  taskCount: deal.taskCount,
  taskCountTooltip: `${deal.taskCount} task${deal.taskCount === 1 ? "" : "s"}`,
  ariaLabel: `Deal: ${deal.name}`
});

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
      {
        deals: s.deals,
        totalCount: s.totalCount,
        page: 0,
        isLoadingMore: false
      }
    ])
  );

const DealsKanbanBoard: React.FC = () => {
  const searchKeyword = "";

  // Replace mock data
  const stages: CrmDealStageType[] = MOCK_STAGES;
  const stageIds = stages.map((s) => s.id);
  const isInitLoading = false;
  const isDealsLoading = false;

  const [stageMap, setStageMap] = useState<Record<number, StageState>>({});

  useEffect(() => {
    const seedData: BoardStageDeals[] = MOCK_STAGES.map((s) => ({
      stageId: s.id,
      deals: MOCK_DEALS[s.id] ?? [],
      totalCount: (MOCK_DEALS[s.id] ?? []).length
    }));
    setStageMap(buildInitialStageState(seedData));
  }, []);

  const stageMapRef = useRef(stageMap);
  stageMapRef.current = stageMap;

  const [activeDeal, setActiveDeal] = useState<BoardDealItem | null>(null);
  const [activeStageId, setActiveStageId] = useState<number | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);

  const originalStageIdRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const snapshotRef = useRef<Record<number, StageState> | null>(null);

  // Replace stubs with useReorderWithinStage / useMoveBetweenStages / useLoadMoreDeals
  const reorderWithinStage = (_payload: BoardReorderWithinStagePayload) => {};
  const moveBetweenStages = (_payload: BoardMoveBetweenStagesPayload) => {};

  const loadMore = (_payload: BoardDealsGroupedRequest) => {};

  const handleLoadMore = (stageIdStr: string) => {
    const stageId = Number(stageIdStr);
    const s = stageMapRef.current[stageId];
    if (!s || s.isLoadingMore) return;
    setStageMap((prev) => ({
      ...prev,
      [stageId]: { ...prev[stageId], isLoadingMore: true }
    }));
    loadMore({
      stageIds: [stageId],
      searchKeyword: searchKeyword || undefined,
      page: s.page + 1,
      limit: PAGE_LIMIT
    });
  };

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
      ? Number(overId.replace("stage::", ""))
      : (() => {
          const overDealId = Number(overId);
          for (const [sid, state] of Object.entries(stageMapRef.current)) {
            if (state.deals.some((d) => d.id === overDealId))
              return Number(sid);
          }
          return null;
        })();

    setOverStageId(targetStageId);

    const activeDealId = Number(active.id);
    if (!targetStageId || !activeStageId || activeStageId === targetStageId)
      return;

    setStageMap((prev) => {
      const srcState = prev[activeStageId];
      const tgtState = prev[targetStageId];
      if (!srcState || !tgtState) return prev;

      const deal = srcState.deals.find((d) => d.id === activeDealId);
      if (!deal) return prev;

      const srcDeals = srcState.deals.filter((d) => d.id !== activeDealId);

      let tgtDeals = tgtState.deals.filter((d) => d.id !== activeDealId);
      if (overId.startsWith("stage::")) {
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
            ...tgtDeals.slice(overIndex)
          ];
        }
      }

      return {
        ...prev,
        [activeStageId]: {
          ...srcState,
          deals: srcDeals,
          totalCount: Math.max(0, srcState.totalCount - 1)
        },
        [targetStageId]: {
          ...tgtState,
          deals: tgtDeals,
          totalCount:
            tgtState.totalCount +
            (tgtState.deals.some((d) => d.id === activeDealId) ? 0 : 1)
        }
      };
    });
    setActiveStageId(targetStageId);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeDealId = Number(active.id);
    const finalStageId = activeStageId;
    const sourceStageId = originalStageIdRef.current;

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
      moveBetweenStages({
        dealId: activeDealId,
        newStageId: finalStageId,
        previousDealId: targetDeals[activeIndex - 1]?.id ?? null,
        nextDealId: targetDeals[activeIndex + 1]?.id ?? null
      });
      return;
    }
    const overId = String(over.id);
    if (overId.startsWith("stage::")) return;

    const overDealId = Number(overId);
    const overIndex = targetDeals.findIndex((d) => d.id === overDealId);
    if (overIndex === -1 || activeIndex === overIndex) return;

    const reordered = arrayMove(targetDeals, activeIndex, overIndex);
    setStageMap((prev) => ({
      ...prev,
      [finalStageId]: { ...prev[finalStageId], deals: reordered }
    }));

    reorderWithinStage({
      dealId: activeDealId,
      previousDealId: reordered[overIndex - 1]?.id ?? null,
      nextDealId: reordered[overIndex + 1]?.id ?? null
    });
  };

  const handleDragCancel = () => {
    setActiveDeal(null);
    setActiveStageId(null);
    setOverStageId(null);
    originalStageIdRef.current = null;
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
              (sum, d) =>
                sum + (Number.parseFloat(String(d.amount ?? "0")) || 0),
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
                  formattedTotal: formatValue(String(totalValue)),
                  totalCount
                }}
                deals={deals.map(toStageLaneDeal)}
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

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeDeal && (
            <div className="w-74 rotate-1 opacity-95 shadow-2xl">
              <DealCard
                id={String(activeDeal.id)}
                title={activeDeal.name}
                contactName={activeDeal.contactName ?? undefined}
                company={activeDeal.companyName ?? ""}
                owner={{
                  id: String(activeDeal.owner.employeeId),
                  firstName: activeDeal.owner.firstName,
                  lastName: activeDeal.owner.lastName ?? undefined,
                  src: activeDeal.owner.authPic ?? undefined
                }}
                formattedValue={formatValue(activeDeal.amount)}
                priority={activeDeal.priority}
                taskCount={activeDeal.taskCount}
                isInteractive={false}
                ariaLabel={activeDeal.name}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DealsKanbanBoard;
