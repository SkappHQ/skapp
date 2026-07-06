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
  CrmBoardDealSliceType,
  CrmBoardStageDealsType,
  KanbanDragData
} from "~community/crm/types/BoardTypes";

import {
  applyMoveToStageMap,
  applyReorderToStageMap,
  computeMoveNeighbors,
  computeReorderWithinStage,
  findDealById,
  findStageIdByDealId,
  resolveInsertIndex
} from "../utils/kanbanUtil";

interface UseKanbanDragReturn {
  stageMap: CrmBoardStageDealsType[];
  activeDeal: CrmBoardDealSliceType | null;
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

  const [activeDeal, setActiveDeal] = useState<CrmBoardDealSliceType | null>(
    null
  );

  const [overStageId, setOverStageId] = useState<number | null>(null);

  const dragStartSnapshotRef = useRef<CrmBoardStageDealsType[] | null>(null);

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
    const overData = over?.data.current as KanbanDragData | undefined;
    setOverStageId(overData?.stageId ?? null);
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
    const overData = over.data.current as KanbanDragData | undefined;
    if (!overData) {
      cleanup();
      return;
    }
    const targetStageId = overData.stageId;
    const isOverStageContainer = overData.type === "stage";
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

      const insertIndex = resolveInsertIndex(
        isOverStageContainer,
        targetDeals,
        Number(over.id),
        active.rect.current.translated,
        over.rect
      );

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
