import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { FC } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { DRAG_ACTIVATION_DISTANCE } from "~community/crm/constants/boardConstants";
import { useBoardData } from "~community/crm/hooks/useBoardData";
import useDealDetailPanel from "~community/crm/hooks/useDealDetailPanel";
import { useKanbanDrag } from "~community/crm/hooks/useKanbanDrag";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";

interface DealsKanbanBoardProps {
  searchKeyword?: string;
}

const DealsKanbanBoard: FC<DealsKanbanBoardProps> = ({
  searchKeyword = ""
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE }
    }),
    useSensor(KeyboardSensor)
  );

  const { boardStages, isLoading } = useBoardData({
    searchKeyword
  });

  const { openDealDetail } = useDealDetailPanel();

  const {
    stageMap,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useKanbanDrag();

  const handleAddDeal = (stageId: number) => {
    const { setPreselectedStageId, openCrmSidePanel } = useCrmStore.getState();
    setPreselectedStageId(stageId);
    openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-stretch gap-4 h-full overflow-x-auto py-2">
          {boardStages.map((stage) => {
            const stageDeals = stageMap.find((s) => s.stageId === stage.id);
            const deals = stageDeals?.deals ?? [];

            return (
              <DealStageLane
                key={stage.id}
                stage={stage}
                deals={deals}
                isLoading={isLoading}
                currentPage={stageDeals?.currentPage ?? 0}
                hasNextPage={stageDeals?.hasNextPage ?? false}
                totalCount={stageDeals?.totalCount ?? 0}
                isOver={overStageId === stage.id}
                searchKeyword={searchKeyword}
                onDealClick={openDealDetail}
                onAddDeal={handleAddDeal}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="w-69">
              <DealCard
                id={activeDeal.id}
                title={activeDeal.name}
                contactName={activeDeal.contactName}
                companyName={activeDeal.companyName ?? undefined}
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
