import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { FC, useEffect, useRef, useState } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { DEAL_KANBAN_PAGE_SIZE } from "~community/crm/constants/dealConstants";
import { useKanbanDrag } from "~community/crm/hooks/useKanbanDrag";
import type {
  BoardDealsGroupedRequest,
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";
import {
  type StageMap,
  buildInitialStageState,
  getAccentColor
} from "~community/crm/utils/kanbanUtil";

import { MOCK_DEALS, MOCK_STAGES } from "./mockData";

interface DealsKanbanBoardProps {
  searchKeyword?: string;
}

const DealsKanbanBoard: FC<DealsKanbanBoardProps> = ({
  searchKeyword = ""
}) => {
  const stages: CrmDealStageType[] = MOCK_STAGES;
  const stageIds = stages.map((s) => s.id);
  const isInitLoading = false;
  const isDealsLoading = false;

  const [stageMap, setStageMap] = useState<StageMap>({});

  useEffect(() => {
    setStageMap(
      buildInitialStageState(
        MOCK_STAGES.map((s) => ({
          stageId: s.id,
          deals: MOCK_DEALS[s.id] ?? [],
          totalCount: (MOCK_DEALS[s.id] ?? []).length
        }))
      )
    );
  }, []);

  const stageMapRef = useRef(stageMap);
  stageMapRef.current = stageMap;

  // Replace stubs with useReorderWithinStage / useMoveBetweenStages / useLoadMoreDeals
  const reorderWithinStage = (_payload: BoardReorderWithinStagePayload) => {};
  const moveBetweenStages = (_payload: BoardMoveBetweenStagesPayload) => {};

  const loadMore = (_payload: BoardDealsGroupedRequest) => {};

  const {
    sensors,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useKanbanDrag({
    stageMapRef,
    setStageMap,
    reorderWithinStage,
    moveBetweenStages
  });

  const isInitialLoad =
    isInitLoading || (stageIds.length > 0 && isDealsLoading);

  const handleLoadMore = (stageId: number, nextPage: number) =>
    loadMore({
      stageIds: [stageId],
      searchKeyword: searchKeyword || undefined,
      page: nextPage,
      limit: DEAL_KANBAN_PAGE_SIZE
    });

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
                hasNextPage={hasMore}
                isOver={overStageId === stage.id}
                onDealClick={() => {}}
                onAddDeal={() => {}}
                onLoadMore={(nextPage) => handleLoadMore(stage.id, nextPage)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="w-69 opacity-95">
              <DealCard
                id={String(activeDeal.id)}
                title={activeDeal.name}
                contactName={activeDeal.contact.name}
                companyName={activeDeal.company?.name}
                owner={activeDeal.owner}
                amount={activeDeal.amount ?? ""}
                priority={activeDeal.priority}
                taskCount={activeDeal.taskCount}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DealsKanbanBoard;
