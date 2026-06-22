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
import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmIndustryEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import type {
  BoardDealsGroupedRequest,
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

// --- Mock stages replace this ---
const MOCK_STAGES: CrmDealStageType[] = [
  {
    id: 1,
    name: "Lead",
    color: CrmDealStageColorsEnum.PINK,
    orderIndex: 1,
    stageType: CrmDealStageEnum.INITIAL
  },
  {
    id: 2,
    name: "Qualified",
    color: CrmDealStageColorsEnum.TEAL,
    orderIndex: 2,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 3,
    name: "Demo scheduled",
    color: CrmDealStageColorsEnum.LAVENDER,
    orderIndex: 3,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 4,
    name: "Proposal sent",
    color: CrmDealStageColorsEnum.GOLD,
    orderIndex: 4,
    stageType: CrmDealStageEnum.OPEN
  },
  {
    id: 5,
    name: "Deal Won",
    color: CrmDealStageColorsEnum.LIME,
    orderIndex: 5,
    stageType: CrmDealStageEnum.WON
  },
  {
    id: 6,
    name: "Deal Lost",
    color: CrmDealStageColorsEnum.ROSEWOOD,
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

// mock deals grouped by stage (replace with api)
const MOCK_DEALS: Record<number, CrmDealBoardType[]> = {
  1: [
    {
      id: 101,
      name: "Acme Corp Expansion",
      description: null,
      stage: MOCK_STAGES[0],
      priority: CrmPriorityEnum.HIGH,
      amount: "12000",
      company: {
        id: 1,
        name: "Acme Corp",
        industry: CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 1,
        name: "John Smith",
        email: "john@acme.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 0
    },
    {
      id: 102,
      name: "Beta Solutions Onboarding",
      description: null,
      stage: MOCK_STAGES[0],
      priority: CrmPriorityEnum.LOW,
      amount: "4500",
      company: {
        id: 2,
        name: "Beta Solutions",
        industry: CrmIndustryEnum.PROFESSIONAL_SERVICES,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 2,
        name: "Sara Lee",
        email: "sara@beta.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 1
    }
  ],
  2: [
    {
      id: 201,
      name: "Gamma Tech Upgrade",
      description: null,
      stage: MOCK_STAGES[1],
      priority: CrmPriorityEnum.MEDIUM,
      amount: "29000",
      company: {
        id: 3,
        name: "Gamma Tech",
        industry: CrmIndustryEnum.TECHNOLOGY_INFORMATION_AND_MEDIA,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 3,
        name: "Mike Chan",
        email: "mike@gamma.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 2
    }
  ],
  3: [
    {
      id: 301,
      name: "Delta Finance Suite",
      description: null,
      stage: MOCK_STAGES[2],
      priority: CrmPriorityEnum.HIGH,
      amount: "55000",
      company: {
        id: 4,
        name: "Delta Finance",
        industry: CrmIndustryEnum.FINANCIAL_SERVICES,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 4,
        name: "Emma Brown",
        email: "emma@delta.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 5
    }
  ],
  4: [],
  5: [
    {
      id: 501,
      name: "Omega Retail Deal",
      description: null,
      stage: MOCK_STAGES[4],
      priority: CrmPriorityEnum.MEDIUM,
      amount: "18000",
      company: {
        id: 5,
        name: "Omega Retail",
        industry: CrmIndustryEnum.RETAIL,
        website: null,
        address: null,
        contactNumber: null,
        isDeleted: false
      },
      contact: {
        id: 5,
        name: "Tom White",
        email: "tom@omega.com",
        contactNumber: null,
        lastContactAt: null,
        lastModifiedDate: "",
        company: null,
        owner: MOCK_OWNER,
        isDeleted: false
      },
      owner: MOCK_OWNER,
      taskCount: 0
    }
  ],
  6: []
};

const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

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
    snapshotRef.current = { ...stageMapRef.current };
    const dealId = Number(active.id);
    for (const [sid, state] of Object.entries(stageMapRef.current)) {
      const found = state.deals.find((d) => d.id === dealId);
      if (found) {
        setActiveDeal(found);
        setActiveStageId(Number(sid));
        originalStageIdRef.current = Number(sid);
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
    if (!targetStageId || !activeStageId) return;

    if (activeStageId === targetStageId) {
      if (overId.startsWith("stage::")) return;
      const overDealId = Number(overId);
      if (overDealId === activeDealId) return;

      setStageMap((prev) => {
        const state = prev[targetStageId];
        if (!state) return prev;
        const activeIndex = state.deals.findIndex((d) => d.id === activeDealId);
        const overIndex = state.deals.findIndex((d) => d.id === overDealId);
        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
          return prev;
        return {
          ...prev,
          [targetStageId]: {
            ...state,
            deals: arrayMove(state.deals, activeIndex, overIndex)
          }
        };
      });
      return;
    }

    // Cross stage: move deal from source to target
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

    if (!over || !finalStageId || !sourceStageId) {
      if (snapshotRef.current) {
        setStageMap(snapshotRef.current);
        snapshotRef.current = null;
      }
      return;
    }

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
      snapshotRef.current = null;
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
    snapshotRef.current = null;
  };

  const handleDragCancel = () => {
    if (snapshotRef.current) {
      setStageMap(snapshotRef.current);
      snapshotRef.current = null;
    }
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

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
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
