import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  SensorDescriptor,
  SensorOptions,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRef, useState } from "react";

import type { StageMap } from "~community/crm/types/BoardTypes";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

import {
  buildInitialStageState,
  resolveTargetStageId
} from "../utils/kanbanUtil";

interface UseKanbanDragProps {
  stages: CrmDealStageType[];
  dealsByStage: Record<number, CrmDealBoardType[]>;
}

interface UseKanbanDragReturn {
  stageMap: StageMap;
  activeDeal: CrmDealBoardType | null;
  overStageId: number | null;
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

export const useKanbanDrag = ({
  stages,
  dealsByStage
}: UseKanbanDragProps): UseKanbanDragReturn => {
  const [stageMap, setStageMap] = useState<StageMap>(() =>
    buildInitialStageState(stages, dealsByStage)
  );
  const [activeDeal, setActiveDeal] = useState<CrmDealBoardType | null>(null);
  const [overStageId, setOverStageId] = useState<number | null>(null);

  const dragStartSnapshotRef = useRef<StageMap | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findDeal = (id: number): CrmDealBoardType | null => {
    for (const stage of stageMap) {
      const deal = stage.deals.find((d) => d.id === id);
      if (deal) return deal;
    }
    return null;
  };

  const findStageOfDeal = (id: number): number | null => {
    const stage = stageMap.find((s) => s.deals.some((d) => d.id === id));
    return stage ? stage.stageId : null;
  };

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const deal = findDeal(Number(active.id));

    if (deal) setActiveDeal(deal);
    dragStartSnapshotRef.current = stageMap;
  };

  const handleDragOver = ({ active, over }: DragOverEvent): void => {
    if (!over) {
      setOverStageId(null);
      return;
    }

    const activeDealId = Number(active.id);
    const overDealId = Number(over.id);
    const sourceStageId = findStageOfDeal(activeDealId);
    const targetStageId = resolveTargetStageId(String(over.id), stageMap);

    if (sourceStageId === null || targetStageId === null) return;

    setOverStageId(targetStageId);

    if (sourceStageId === targetStageId) {
      setStageMap((prev) =>
        prev.map((stage) => {
          if (stage.stageId !== sourceStageId) return stage;

          const activeIndex = stage.deals.findIndex(
            (d) => d.id === activeDealId
          );
          const overIndex = stage.deals.findIndex((d) => d.id === overDealId);

          if (
            activeIndex === -1 ||
            overIndex === -1 ||
            activeIndex === overIndex
          ) {
            return stage;
          }

          return {
            ...stage,
            deals: arrayMove(stage.deals, activeIndex, overIndex)
          };
        })
      );
      return;
    }

    setStageMap((prev) => {
      const sourceStage = prev.find((s) => s.stageId === sourceStageId);
      const activeIndex = sourceStage?.deals.findIndex(
        (d) => d.id === activeDealId
      );
      if (!sourceStage || activeIndex === undefined || activeIndex === -1) {
        return prev;
      }

      const deal = sourceStage.deals[activeIndex];

      return prev.map((stage) => {
        if (stage.stageId === sourceStageId) {
          return {
            ...stage,
            deals: stage.deals.filter((d) => d.id !== activeDealId),
            totalCount: Math.max(0, stage.totalCount - 1)
          };
        }

        if (stage.stageId === targetStageId) {
          const overIndex = stage.deals.findIndex((d) => d.id === overDealId);
          const insertAt = overIndex === -1 ? stage.deals.length : overIndex;

          return {
            ...stage,
            deals: [
              ...stage.deals.slice(0, insertAt),
              deal,
              ...stage.deals.slice(insertAt)
            ],
            totalCount: stage.totalCount + 1
          };
        }

        return stage;
      });
    });
  };

  const handleDragEnd = (): void => {
    dragStartSnapshotRef.current = null;
    setActiveDeal(null);
    setOverStageId(null);
  };

  const handleDragCancel = (): void => {
    if (dragStartSnapshotRef.current) {
      setStageMap(dragStartSnapshotRef.current);
      dragStartSnapshotRef.current = null;
    }
    setActiveDeal(null);
    setOverStageId(null);
  };

  return {
    stageMap,
    activeDeal,
    overStageId,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
};
