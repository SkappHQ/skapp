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

import { ToastType } from "~community/common/enums/ComponentEnums";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DealCard from "~community/crm/components/molecules/DealCard/DealCard";
import DealStageLane from "~community/crm/components/molecules/DealStageLane/DealStageLane";
import { DRAG_ACTIVATION_DISTANCE } from "~community/crm/constants/boardConstants";
import { useBoardData } from "~community/crm/hooks/useBoardData";
import { useKanbanDrag } from "~community/crm/hooks/useKanbanDrag";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/SidePanelTypes";
import { canAccessDeal } from "~community/crm/utils/dealAccessUtil";
import { findDealById } from "~community/crm/utils/kanbanUtil";

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

  const {
    stageMap,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useKanbanDrag();

  const { userId, isCrmAdmin, isCrmSalesManager } = useSessionData();
  const { setToastMessage } = useToast();
  const translateText = useTranslator("crmModule", "common", "permissionToast");

  const handleAddDeal = (stageId: number) => {
    const { setPreselectedStageId, openCrmSidePanel } = useCrmStore.getState();
    setPreselectedStageId(stageId);
    openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
  };

  const handleDealClick = (dealId: number) => {
    const deal = findDealById(stageMap, dealId);
    if (
      !canAccessDeal(deal.owner.employeeId, {
        userId,
        isCrmAdmin,
        isCrmSalesManager
      })
    ) {
      setToastMessage({
        open: true,
        toastType: ToastType.WARN,
        title: translateText(["title"]),
        description: translateText(["description"])
      });
      return;
    }
    const { setSelectedDealId, openCrmSidePanel } = useCrmStore.getState();
    setSelectedDealId(dealId);
    openCrmSidePanel(CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL);
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
                onDealClick={handleDealClick}
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
