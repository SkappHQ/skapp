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
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { DRAG_ACTIVATION_DISTANCE } from "~community/crm/constants/boardConstants";
import DealStageLaneV2 from "~community/crm/v2/components/molecules/DealStageLaneV2/DealStageLaneV2";
import { useBoardDataV2 } from "~community/crm/v2/hooks/useBoardDataV2";
import { useKanbanDragV2 } from "~community/crm/v2/hooks/useKanbanDragV2";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import useCrmLimitGuard from "~enterprise/crm/hooks/useCrmLimitGuard";
import { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

import BoardCardOverlay from "./BoardCardOverlay";

interface DealsKanbanBoardV2Props {
  searchKeyword?: string;
}

const DealsKanbanBoardV2: FC<DealsKanbanBoardV2Props> = ({
  searchKeyword = ""
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE }
    }),
    useSensor(KeyboardSensor)
  );

  const translateText = useTranslator("crmModule", "deals", "kanban");
  const { setToastMessage } = useToast();

  const handleMoveError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "moveErrorTitle"]),
      description: translateText(["toastMessages", "moveErrorDescription"])
    });
  };

  const { stageIds, isLoading } = useBoardDataV2({ searchKeyword });

  const {
    activeDealId,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  } = useKanbanDragV2({ onError: handleMoveError });

  const { guardCrmCreate, isCheckingCrmLimit } = useCrmLimitGuard();

  const handleAddDeal = (stageId: number): void => {
    guardCrmCreate(CrmLimitResource.DEALS, () => {
      const { setPreselectedStageId, openCrmSidePanel } =
        useCrmStoreV2.getState();
      setPreselectedStageId(stageId);
      openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
    });
  };

  const handleDealClick = (dealId: number): void => {
    const { setSelectedDealId, openCrmSidePanel } = useCrmStoreV2.getState();
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
        <div className="flex h-full overflow-x-auto overflow-y-hidden rounded-lg border border-secondary-accent p-2">
          {stageIds.map((stageId) => (
            <div key={stageId} className="shrink-0 m-2">
              <DealStageLaneV2
                stageId={stageId}
                isLoading={isLoading}
                isOver={overStageId === stageId}
                searchKeyword={searchKeyword}
                onDealClick={handleDealClick}
                onAddDeal={handleAddDeal}
                isAddDealDisabled={isCheckingCrmLimit}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeDealId != null && <BoardCardOverlay dealId={activeDealId} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default DealsKanbanBoardV2;
