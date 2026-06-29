import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/react";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
  applyDealMove,
  findDealById,
  findStageIdByDealId,
  getNeighbourDealIds
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
  const { boardStageDeals, setBoardStageDeals } = useCrmStore(
    useShallow((store) => ({
      boardStageDeals: store.boardStageDeals,
      setBoardStageDeals: store.setBoardStageDeals
    }))
  );

  const [activeDeal, setActiveDeal] = useState<CrmBoardDealResponseType | null>(
    null
  );
  const [overStageId, setOverStageId] = useState<number | null>(null);

  const dragStartSnapshotRef = useRef<CrmBoardStageDealsResponseType[] | null>(
    null
  );

  const rollback = () => {
    if (dragStartSnapshotRef.current) {
      setBoardStageDeals(dragStartSnapshotRef.current);
    }
  };

  const { mutate: reorderDealWithinStage } =
    useReorderDealWithinStage(rollback);
  const { mutate: moveDealToStage } = useMoveDealBetweenStages(rollback);

  const handleDragStart = ({ operation }: DragStartEvent): void => {
    const sourceId = operation.source?.id;
    if (sourceId == null) return;

    setActiveDeal(findDealById(boardStageDeals, Number(sourceId)));
    dragStartSnapshotRef.current = boardStageDeals;
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const sourceId = event.operation.source?.id;
    if (sourceId == null) return;

    const next = applyDealMove(boardStageDeals, event);
    setOverStageId(findStageIdByDealId(next, Number(sourceId)));

    if (next !== boardStageDeals) {
      setBoardStageDeals(next);
    }
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const activeDealId = Number(event.operation.source?.id);

    if (event.canceled) {
      rollback();
      dragStartSnapshotRef.current = null;
      setActiveDeal(null);
      setOverStageId(null);
      return;
    }

    const sourceStageId = dragStartSnapshotRef.current
      ? findStageIdByDealId(dragStartSnapshotRef.current, activeDealId)
      : null;

    const finalStageMap = applyDealMove(boardStageDeals, event);
    if (finalStageMap !== boardStageDeals) {
      setBoardStageDeals(finalStageMap);
    }

    const targetStageId = findStageIdByDealId(finalStageMap, activeDealId);

    if (targetStageId !== null) {
      const { previousDealId, nextDealId } = getNeighbourDealIds(
        finalStageMap,
        targetStageId,
        activeDealId
      );

      if (sourceStageId === targetStageId) {
        reorderDealWithinStage({
          dealId: activeDealId,
          previousDealId,
          nextDealId
        });
      } else {
        moveDealToStage({
          dealId: activeDealId,
          newStageId: targetStageId,
          previousDealId,
          nextDealId
        });
      }
    }

    dragStartSnapshotRef.current = null;
    setActiveDeal(null);
    setOverStageId(null);
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
