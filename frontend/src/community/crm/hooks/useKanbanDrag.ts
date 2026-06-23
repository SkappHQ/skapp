import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

import type {
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  CrmDealBoardType
} from "~community/crm/types/CommonTypes";

import {
  type SetStageMap,
  type StageMap,
  commitCrossStageMove,
  commitSameStageReorder,
  resolveTargetStageId
} from "../utils/kanbanUtil";

interface UseKanbanDragProps {
  stageMapRef: React.MutableRefObject<StageMap>;
  setStageMap: SetStageMap;
  reorderWithinStage: (payload: BoardReorderWithinStagePayload) => void;
  moveBetweenStages: (payload: BoardMoveBetweenStagesPayload) => void;
}

export interface UseKanbanDragReturn {
  sensors: ReturnType<typeof useSensors>;
  activeDeal: CrmDealBoardType | null;
  overStageId: number | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

export const useKanbanDrag = ({
  stageMapRef,
  setStageMap,
  reorderWithinStage,
  moveBetweenStages
}: UseKanbanDragProps): UseKanbanDragReturn => {
  const [activeDeal, setActiveDeal] = useState<CrmDealBoardType | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const dealId = Number(active.id);
    for (const state of Object.values(stageMapRef.current)) {
      const found = state.deals.find((d) => d.id === dealId);
      if (found) {
        setActiveDeal(found);
        break;
      }
    }
  };

  const handleDragOver = ({ over }: DragOverEvent): void => {
    setOverStageId(
      over ? resolveTargetStageId(String(over.id), stageMapRef.current) : null
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    setActiveDeal(null);
    setOverStageId(null);

    if (!over || !active) return;

    const activeDealId = Number(active.id);
    const overId = String(over.id);

    let sourceStageId = -1;
    for (const [sid, state] of Object.entries(stageMapRef.current)) {
      if (state.deals.some((d) => d.id === activeDealId)) {
        sourceStageId = Number(sid);
        break;
      }
    }
    if (sourceStageId === -1) return;

    const targetStageId = resolveTargetStageId(overId, stageMapRef.current);
    if (!targetStageId) return;

    const srcState = stageMapRef.current[sourceStageId];
    const tgtState = stageMapRef.current[targetStageId];
    if (!srcState || !tgtState) return;

    const deal = srcState.deals.find((d) => d.id === activeDealId);
    if (!deal) return;

    if (sourceStageId !== targetStageId) {
      commitCrossStageMove({
        activeDealId,
        deal,
        overId,
        sourceStageId,
        targetStageId,
        srcState,
        tgtState,
        activeMidY:
          (active.rect.current.translated?.top ?? 0) +
          (active.rect.current.translated?.height ?? 0) / 2,
        overMidY: over.rect.top + over.rect.height / 2,
        setStageMap,
        moveBetweenStages
      });
      return;
    }

    commitSameStageReorder({
      activeDealId,
      sourceStageId,
      overId,
      srcDeals: srcState.deals,
      setStageMap,
      reorderWithinStage
    });
  };

  const handleDragCancel = (): void => {
    setActiveDeal(null);
    setOverStageId(null);
  };

  return {
    sensors,
    activeDeal,
    overStageId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
};
