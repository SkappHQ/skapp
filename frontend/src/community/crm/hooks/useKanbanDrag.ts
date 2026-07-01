import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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

import { findDealById, findStageIdByDealId } from "../utils/kanbanUtil";

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
      snapshot.find((stage) => stage.stageId === sourceStageId)?.deals ?? [];
    const targetDeals =
      snapshot.find((stage) => stage.stageId === targetStageId)?.deals ?? [];

    if (sourceStageId === targetStageId) {
      if (isOverStageContainer) {
        cleanup();
        return;
      }

      const overDealId = Number(over.id);
      const activeIndex = sourceDeals.findIndex((deal) => deal.id === activeDealId);
      const overIndex = sourceDeals.findIndex((deal) => deal.id === overDealId);

      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
        cleanup();
        return;
      }

      const reorderedDeals = arrayMove(sourceDeals, activeIndex, overIndex);
      const previousDealId =
        overIndex > 0 ? reorderedDeals[overIndex - 1].id : null;
      const nextDealId =
        overIndex < reorderedDeals.length - 1
          ? reorderedDeals[overIndex + 1].id
          : null;

      const finalStageMap = snapshot.map((stage) =>
        stage.stageId === sourceStageId ? { ...stage, deals: reorderedDeals } : stage
      );

      setBoardStageDeals(finalStageMap);
      reorderDealWithinStage({
        dealId: activeDealId,
        previousDealId,
        nextDealId
      });
    } else {
      let insertIndex = targetDeals.length;

      if (!isOverStageContainer) {
        const overDealId = Number(over.id);
        const overIndex = targetDeals.findIndex((deal) => deal.id === overDealId);

        if (overIndex !== -1) {
          const activeRect = active.rect.current.translated;
          const overRect = over.rect;

          if (activeRect && overRect) {
            const activeCenterY = activeRect.top + activeRect.height / 2;
            const overCenterY = overRect.top + overRect.height / 2;
            insertIndex =
              activeCenterY < overCenterY ? overIndex : overIndex + 1;
          } else {
            insertIndex = overIndex;
          }
        }
      }

      const deal = sourceDeals.find((deal) => deal.id === activeDealId) ?? null;
      if (!deal) {
        cleanup();
        return;
      }

      let previousDealId: number | null = null;
      let nextDealId: number | null = null;

      if (targetDeals.length === 0 || insertIndex === 0) {
        nextDealId = targetDeals[0]?.id ?? null;
      } else if (insertIndex >= targetDeals.length) {
        previousDealId = targetDeals.at(-1)?.id ?? null;
      } else {
        previousDealId = targetDeals[insertIndex - 1].id;
        nextDealId = targetDeals[insertIndex].id;
      }

      const finalStageMap = snapshot.map((stage) => {
        if (stage.stageId === sourceStageId) {
          return {
            ...stage,
            deals: stage.deals.filter((deal) => deal.id !== activeDealId),
            totalCount: stage.totalCount - 1
          };
        }
        if (stage.stageId === targetStageId) {
          return {
            ...stage,
            deals: [
              ...stage.deals.slice(0, insertIndex),
              deal,
              ...stage.deals.slice(insertIndex)
            ],
            totalCount: stage.totalCount + 1
          };
        }
        return stage;
      });

      setBoardStageDeals(finalStageMap);
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
