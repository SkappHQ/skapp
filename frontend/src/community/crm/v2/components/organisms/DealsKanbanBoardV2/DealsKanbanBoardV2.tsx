import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  DEFAULT_BOARD_PAGE_SIZE,
  DRAG_ACTIVATION_DISTANCE
} from "~community/crm/constants/boardConstants";
import { useGetDealsGroupedByStages } from "~community/crm/v2/api/BoardApi";
import DealStageLaneV2 from "~community/crm/v2/components/molecules/DealStageLaneV2/DealStageLaneV2";
import { useKanbanDragV2 } from "~community/crm/v2/hooks/useKanbanDragV2";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import { ingestBoardStageDeals } from "~community/crm/v2/utils/boardUtil";
import { getBoardStageIds } from "~community/crm/v2/utils/selectorUtils";
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

  const { stages, setPreselectedStageId, setSelectedDealId, openCrmSidePanel } =
    useCrmStoreV2(
      useShallow((store) => ({
        stages: store.stages,
        setPreselectedStageId: store.setPreselectedStageId,
        setSelectedDealId: store.setSelectedDealId,
        openCrmSidePanel: store.openCrmSidePanel
      }))
    );

  const stageIds = useMemo(() => getBoardStageIds(stages), [stages]);

  const { data: boardData, isLoading } = useGetDealsGroupedByStages(
    { stageIds, searchKeyword, limit: DEFAULT_BOARD_PAGE_SIZE },
    stageIds.length > 0
  );

  useEffect(() => {
    if (boardData) {
      const store = useCrmStoreV2.getState();
      const next = ingestBoardStageDeals(store, boardData, { append: false });
      store.setDeals(next.deals);
      store.setBoardColumn(next.board);
      store.setDealIds(next.dealIds);
    }
  }, [boardData]);

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
      setPreselectedStageId(stageId);
      openCrmSidePanel(CrmSidePanelTypes.ADD_DEAL_SIDE_PANEL);
    });
  };

  const handleDealClick = (dealId: number): void => {
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
