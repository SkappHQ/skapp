import {
  KeyboardSensor,
  PointerActivationConstraints,
  PointerSensor
} from "@dnd-kit/dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { FC, useEffect, useMemo, useState } from "react";

import {
  fetchDealsGroupedByStages,
  useGetBoardInitData,
  useGetDealsGroupedByStages
} from "~community/crm/api/BoardApi";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import {
  DEFAULT_BOARD_PAGE_SIZE,
  DRAG_ACTIVATION_DISTANCE
} from "~community/crm/constants/boardConstants";
import { useKanbanDrag } from "~community/crm/hooks/useKanbanDrag";
import { useCrmStore } from "~community/crm/store/store";
import {
  normalizeStageDeals,
  resolveBoardDeal
} from "~community/crm/utils/kanbanUtil";

interface DealsKanbanBoardProps {
  searchKeyword?: string;
}

const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({
        value: DRAG_ACTIVATION_DISTANCE
      })
    ]
  }),
  KeyboardSensor
];

const DealsKanbanBoard: FC<DealsKanbanBoardProps> = ({
  searchKeyword = ""
}) => {
  const boardStages = useCrmStore((store) => store.boardStages);
  const boardOwners = useCrmStore((store) => store.boardOwners);
  const boardContacts = useCrmStore((store) => store.boardContacts);
  const setBoardStages = useCrmStore((store) => store.setBoardStages);
  const setBoardContacts = useCrmStore((store) => store.setBoardContacts);
  const setBoardOwners = useCrmStore((store) => store.setBoardOwners);
  const setBoardCrmRoles = useCrmStore((store) => store.setBoardCrmRoles);
  const setBoardStageDeals = useCrmStore((store) => store.setBoardStageDeals);
  const appendBoardStageDeals = useCrmStore(
    (store) => store.appendBoardStageDeals
  );
  const setIsCrmSidePanelOpen = useCrmStore(
    (store) => store.setIsCrmSidePanelOpen
  );
  const setPreselectedStageId = useCrmStore(
    (store) => store.setPreselectedStageId
  );

  const [loadingStageIds, setLoadingStageIds] = useState<number[]>([]);

  const { data: initData, isLoading: isInitDataLoading } =
    useGetBoardInitData();

  useEffect(() => {
    if (!initData) return;
    setBoardStages(initData.stages);
    setBoardContacts(initData.contacts);
    setBoardOwners(initData.owners);
    setBoardCrmRoles(initData.crmRoles);
  }, [
    initData,
    setBoardStages,
    setBoardContacts,
    setBoardOwners,
    setBoardCrmRoles
  ]);

  const stageIds = boardStages.map((stage) => stage.id);

  const { data: dealsByStages, isLoading: isDealsLoading } =
    useGetDealsGroupedByStages(
      { stageIds, searchKeyword, page: 0, limit: DEFAULT_BOARD_PAGE_SIZE },
      stageIds.length > 0
    );

  useEffect(() => {
    if (dealsByStages) {
      setBoardStageDeals(normalizeStageDeals(boardStages, dealsByStages));
    }
  }, [dealsByStages, boardStages, setBoardStageDeals]);

  const {
    stageMap,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useKanbanDrag();

  const resolvedDealsByStage = useMemo(
    () =>
      new Map(
        stageMap.map((stage) => [
          stage.stageId,
          stage.deals.map((deal) =>
            resolveBoardDeal(deal, boardOwners, boardContacts)
          )
        ])
      ),
    [stageMap, boardOwners, boardContacts]
  );

  const resolvedActiveDeal = useMemo(
    () =>
      activeDeal
        ? resolveBoardDeal(activeDeal, boardOwners, boardContacts)
        : null,
    [activeDeal, boardOwners, boardContacts]
  );

  const handleLoadMore = async (stageId: number) => {
    if (loadingStageIds.includes(stageId)) return;

    const stage = stageMap.find((s) => s.stageId === stageId);
    if (!stage || !stage.hasNextPage) return;

    setLoadingStageIds((prev) => [...prev, stageId]);

    try {
      const [result] = await fetchDealsGroupedByStages({
        stageIds: [stageId],
        searchKeyword,
        page: stage.currentPage + 1,
        limit: DEFAULT_BOARD_PAGE_SIZE
      });

      if (result) {
        appendBoardStageDeals(result);
      }
    } finally {
      setLoadingStageIds((prev) => prev.filter((id) => id !== stageId));
    }
  };

  const handleAddDeal = (stageId: number) => {
    setPreselectedStageId(stageId);
    setIsCrmSidePanelOpen(true);
  };

  const isLoading = isInitDataLoading || isDealsLoading;

  return (
    <div className="flex flex-col">
      <DragDropProvider
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-160 items-stretch gap-4 overflow-x-auto py-2">
          {boardStages.map((stage) => {
            const stageDeals = stageMap.find((s) => s.stageId === stage.id);
            const deals = resolvedDealsByStage.get(stage.id) ?? [];

            return (
              <DealStageLane
                key={stage.id}
                stage={stage}
                deals={deals}
                isLoading={isLoading}
                hasNextPage={stageDeals?.hasNextPage ?? false}
                isFetchingNextPage={loadingStageIds.includes(stage.id)}
                isOver={overStageId === stage.id}
                onDealClick={() => {}}
                onAddDeal={handleAddDeal}
                onLoadMore={() => handleLoadMore(stage.id)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {resolvedActiveDeal && (
            <div className="w-69">
              <DealCard
                id={resolvedActiveDeal.id}
                title={resolvedActiveDeal.name}
                contactName={resolvedActiveDeal.contactName}
                companyName={resolvedActiveDeal.companyName ?? undefined}
                owner={resolvedActiveDeal.owner}
                amount={resolvedActiveDeal.amount ?? ""}
                priority={resolvedActiveDeal.priority}
                taskCount={resolvedActiveDeal.taskCount}
              />
            </div>
          )}
        </DragOverlay>
      </DragDropProvider>

      <AddDealSidePanel />
    </div>
  );
};

export default DealsKanbanBoard;
