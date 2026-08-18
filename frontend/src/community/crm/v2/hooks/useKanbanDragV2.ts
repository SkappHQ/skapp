import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { AxiosError } from "axios";
import { useRef, useState } from "react";

import {
  useMoveDealBetweenStages,
  useReorderDealWithinStage
} from "../api/CrmBoardApi";
import { useCrmStoreV2 } from "../store/store";
import { CrmBoardRecord } from "../types/CrmCommonTypes";
import { CrmKanbanDragData } from "../types/CrmTypes";
import {
  findStageIdByDealId,
  moveDealBetweenColumns,
  reorderDealInColumn
} from "../utils/boardUtil";
import {
  computeMoveNeighbors,
  computeReorderWithinStage,
  resolveInsertIndex
} from "../utils/kanbanMath";

interface UseKanbanDragV2Return {
  activeDealId: number | null;
  overStageId: number | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

// Optimistic Kanban drag on the normalized store. The board record is snapshot
// on drag start; a reorder/move is applied to the store immediately, the
// reorder/move endpoint is fired, and the snapshot is restored if that call
// fails. All neighbour/insert-index math is computed against the snapshot's
// dealId arrays (the moved deal is not yet re-inserted), matching the payload
// the backend expects.
export const useKanbanDragV2 = ({
  onError
}: {
  onError?: (error: AxiosError) => void;
} = {}): UseKanbanDragV2Return => {
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);
  const snapshotRef = useRef<CrmBoardRecord | null>(null);

  const rollback = (error: AxiosError): void => {
    if (snapshotRef.current) {
      useCrmStoreV2.getState().setBoardColumn(snapshotRef.current);
    }
    onError?.(error);
  };

  const { mutate: reorderDealWithinStage } =
    useReorderDealWithinStage(rollback);
  const { mutate: moveDealToStage } = useMoveDealBetweenStages(rollback);

  const handleDragStart = ({ active }: DragStartEvent): void => {
    snapshotRef.current = useCrmStoreV2.getState().board;
    setActiveDealId(Number(active.id));
  };

  const handleDragOver = ({ over }: DragOverEvent): void => {
    const overData = over?.data.current as CrmKanbanDragData | undefined;
    setOverStageId(overData?.stageId ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    const activeId = Number(active.id);
    const cleanup = (): void => {
      setActiveDealId(null);
      setOverStageId(null);
    };

    const snapshot = snapshotRef.current;
    if (!over || !snapshot) {
      cleanup();
      return;
    }

    const sourceStageId = findStageIdByDealId(snapshot, activeId);
    const overData = over.data.current as CrmKanbanDragData | undefined;
    if (sourceStageId === null || !overData) {
      cleanup();
      return;
    }

    const targetStageId = overData.stageId;
    const isOverStageContainer = overData.type === "stage";
    const sourceDealIds = snapshot[sourceStageId]?.dealIds ?? [];
    const targetDealIds = snapshot[targetStageId]?.dealIds ?? [];

    if (sourceStageId === targetStageId) {
      if (isOverStageContainer) {
        cleanup();
        return;
      }
      const reorder = computeReorderWithinStage(
        sourceDealIds,
        activeId,
        Number(over.id)
      );
      if (!reorder) {
        cleanup();
        return;
      }
      reorderDealInColumn(sourceStageId, reorder.orderedDealIds);
      reorderDealWithinStage({
        dealId: activeId,
        previousDealId: reorder.previousDealId,
        nextDealId: reorder.nextDealId
      });
    } else {
      const insertIndex = resolveInsertIndex(
        isOverStageContainer,
        targetDealIds,
        Number(over.id),
        active.rect.current.translated ?? null,
        over.rect
      );
      const { previousDealId, nextDealId } = computeMoveNeighbors(
        targetDealIds,
        insertIndex
      );
      moveDealBetweenColumns({
        dealId: activeId,
        fromStageId: sourceStageId,
        toStageId: targetStageId,
        insertIndex
      });
      moveDealToStage({
        dealId: activeId,
        newStageId: targetStageId,
        previousDealId,
        nextDealId
      });
    }

    cleanup();
  };

  return {
    activeDealId,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
