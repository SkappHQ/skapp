import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { FC } from "react";

import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { useKanbanDrag } from "~community/crm/hooks/useKanbanDrag";
import type { CrmDealStageType } from "~community/crm/types/CommonTypes";

import { MOCK_DEALS, MOCK_STAGES } from "./mockData";

interface DealsKanbanBoardProps {
  searchKeyword?: string;
}

const DealsKanbanBoard: FC<DealsKanbanBoardProps> = () => {
  const stages: CrmDealStageType[] = MOCK_STAGES;

  const {
    stageMap,
    activeDeal,
    overStageId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useKanbanDrag({ stages, dealsByStage: MOCK_DEALS });

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
        <div className="flex h-160 items-stretch gap-4 overflow-x-auto py-2">
          {stages.map((stage) => {
            const deals =
              stageMap.find((s) => s.stageId === stage.id)?.deals ?? [];

            return (
              <DealStageLane
                key={stage.id}
                stage={stage}
                deals={deals}
                isLoading={false}
                hasNextPage={false}
                isOver={overStageId === stage.id}
                onDealClick={() => {}}
                onAddDeal={() => {}}
                onLoadMore={() => {}}
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
