import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  useMoveDealBetweenStages,
  useReorderDealWithinStage
} from "../api/BoardApi";
import { CrmKanbanDragType } from "../enums/common";
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

export const useKanbanDragV2 = ({
  onError
}: {
  onError?: (error: AxiosError) => void;
} = {}): UseKanbanDragV2Return => {
  const [activeDealId, setActiveDealId] = useState<number | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);
  const snapshotRef = useRef<CrmBoardRecord | null>(null);
  // The moved deal's stageId at drag start. A cross-stage move restamps
  // deals[dealId].stageId (via moveDealBetweenColumns), so restoring the board
  // alone would leave the deal record pointing at the failed target stage.
  const dealStageSnapshotRef = useRef<{
    id: number;
    stageId: number | undefined;
  } | null>(null);

  const { board, deals, setBoardColumn, setDeals } = useCrmStoreV2(
    useShallow((store) => ({
      board: store.board,
      deals: store.deals,
      setBoardColumn: store.setBoardColumn,
      setDeals: store.setDeals
    }))
  );

  const rollback = (error: AxiosError): void => {
    if (snapshotRef.current) {
      setBoardColumn(snapshotRef.current);
    }
    const dealSnapshot = dealStageSnapshotRef.current;
    if (dealSnapshot) {
      const deal = deals[dealSnapshot.id];
      if (deal && deal.stageId !== dealSnapshot.stageId) {
        setDeals({
          ...deals,
          [dealSnapshot.id]: { ...deal, stageId: dealSnapshot.stageId }
        });
      }
    }
    onError?.(error);
  };

  const { mutate: reorderDealWithinStage } =
    useReorderDealWithinStage(rollback);
  const { mutate: moveDealToStage } = useMoveDealBetweenStages(rollback);

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const id = Number(active.id);
    snapshotRef.current = board;
    dealStageSnapshotRef.current = { id, stageId: deals[id]?.stageId };
    setActiveDealId(id);
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
    const isOverStageContainer = overData.type === CrmKanbanDragType.STAGE;
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
      setBoardColumn(
        reorderDealInColumn(board, sourceStageId, reorder.orderedDealIds)
      );
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
      const next = moveDealBetweenColumns(
        { board, deals },
        {
          dealId: activeId,
          fromStageId: sourceStageId,
          toStageId: targetStageId,
          insertIndex
        }
      );
      setBoardColumn(next.board);
      setDeals(next.deals);
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
