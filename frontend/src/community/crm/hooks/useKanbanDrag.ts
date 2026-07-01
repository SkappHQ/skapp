import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { useRef, useState } from "react";

import {
  useMoveDealBetweenStages,
  useReorderDealWithinStage
} from "~community/crm/api/BoardApi";
import { useCrmStore } from "~community/crm/store/store";
import type {
  CrmBoardDealResponseType,
  CrmBoardStageDealsResponseType
} from "~community/crm/types/BoardTypes";

import {
  applyMoveToStageMap,
  applyReorderToStageMap,
  computeInsertIndex,
  computeMoveNeighbors,
  computeReorderWithinStage,
  findDealById,
  findStageIdByDealId
} from "../utils/kanbanUtil";

interface UseKanbanDragReturn {
  stageMap: CrmBoardStageDealsResponseType[];
  activeDeal: CrmBoardDealResponseType | null;
  overStageId: number | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const useKanbanDrag = (): UseKanbanDragReturn => {
  
  const { boardStageDeals, setBoardStageDeals } = useCrmStore((store) => ({
    boardStageDeals: store.boardStageDeals,
    setBoardStageDeals: store.setBoardStageDeals
  }));

  const [activeDeal, setActiveDeal] = useState<CrmBoardDealResponseType | null>(
    null
  );

  const [overStageId, setOverStageId] = useState<number | null>(null);

  const dragStartSnapshotRef = useRef<CrmBoardStageDealsResponseType[] | null>(
    null
  );

  const rollback = (): void => {
    if (dragStartSnapshotRef.current) {
      setBoardStageDeals(dragStartSnapshotRef.current);
    }
  };

  const { mutate: reorderDealWithinStage } =
    useReorderDealWithinStage(rollback);
  const { mutate: moveDealToStage } = useMoveDealBetweenStages(rollback);

  const handleDragStart = ({ active }: DragStartEvent): void => {
    dragStartSnapshotRef.current = boardStageDeals;
    setActiveDeal(findDealById(boardStageDeals, Number(active.id)));
  };

  const handleDragOver = ({ over }: DragOverEvent): void => {
    const stageId: number | undefined = over?.data.current?.stageId;
    if (stageId) setOverStageId(stageId);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    const activeDealId = Number(active.id);
    const cleanup = (): void => {
      setActiveDeal(null);
      setOverStageId(null);
    };

    if (!over) {
      cleanup();
      return;
    }
    const snapshot = dragStartSnapshotRef.current;
    if (!snapshot) {
      cleanup();
      return;
    }
    const sourceStageId = findStageIdByDealId(snapshot, activeDealId);
    if (sourceStageId === null) {
      cleanup();
      return;
    }
    const targetStageId: number | undefined = over.data.current?.stageId;
    if (!targetStageId) {
      cleanup();
      return;
    }

    const isOverStageContainer = over.data.current?.type === "stage";
    const sourceDeals =
      snapshot.find((s) => s.stageId === sourceStageId)?.deals ?? [];
    const targetDeals =
      snapshot.find((s) => s.stageId === targetStageId)?.deals ?? [];

    if (sourceStageId === targetStageId) {
      if (isOverStageContainer) {
        cleanup();
        return;
      }
      const reorder = computeReorderWithinStage(
        sourceDeals,
        activeDealId,
        Number(over.id)
      );
      if (!reorder) {
        cleanup();
        return;
      }
      setBoardStageDeals(
        applyReorderToStageMap(snapshot, sourceStageId, reorder.reorderedDeals)
      );
      reorderDealWithinStage({
        dealId: activeDealId,
        previousDealId: reorder.previousDealId,
        nextDealId: reorder.nextDealId
      });
    } else {
      const deal = sourceDeals.find((d) => d.id === activeDealId) ?? null;
      if (!deal) {
        cleanup();
        return;
      }

      const insertIndex = isOverStageContainer
        ? targetDeals.length
        : (() => {
            const activeRect = active.rect.current.translated;
            const overRect = over.rect;
            const activeCenterY = activeRect
              ? activeRect.top + activeRect.height / 2
              : null;
            const overCenterY = overRect
              ? overRect.top + overRect.height / 2
              : null;
            return computeInsertIndex(
              targetDeals,
              Number(over.id),
              activeCenterY,
              overCenterY
            );
          })();

      const { previousDealId, nextDealId } = computeMoveNeighbors(
        targetDeals,
        insertIndex
      );
      setBoardStageDeals(
        applyMoveToStageMap(
          snapshot,
          sourceStageId,
          targetStageId,
          insertIndex,
          deal,
          activeDealId
        )
      );
      moveDealToStage({
        dealId: activeDealId,
        newStageId: targetStageId,
        previousDealId,
        nextDealId
      });
    }

    cleanup();
  };

  return {
    stageMap: boardStageDeals,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
