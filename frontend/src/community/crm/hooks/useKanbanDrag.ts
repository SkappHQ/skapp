import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRef, useState } from "react";

import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

import {
  type StageMap,
  buildInitialStageState,
  resolveTargetStageId
} from "../utils/kanbanUtil";

interface UseKanbanDragProps {
  stages: CrmDealStageType[];
  dealsByStage: Record<number, CrmDealBoardType[]>;
}

export interface UseKanbanDragReturn {
  stageMap: StageMap;
  activeDeal: CrmDealBoardType | null;
  overStageId: number | null;
  sensors: ReturnType<typeof useSensors>;
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
    for (const stage of Object.values(stageMap)) {
      const deal = stage.deals.find((d) => d.id === id);
      if (deal) return deal;
    }
    return null;
  };

  const findStageOfDeal = (id: number): number | null => {
    for (const [stageId, stage] of Object.entries(stageMap)) {
      if (stage.deals.some((d) => d.id === id)) {
        return Number(stageId);
      }
    }
    return null;
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
      setStageMap((prev) => {
        const deals = prev[sourceStageId].deals;
        const activeIndex = deals.findIndex((d) => d.id === activeDealId);
        const overIndex = deals.findIndex((d) => d.id === overDealId);

        if (
          activeIndex === -1 ||
          overIndex === -1 ||
          activeIndex === overIndex
        ) {
          return prev;
        }

        return {
          ...prev,
          [sourceStageId]: {
            ...prev[sourceStageId],
            deals: arrayMove(deals, activeIndex, overIndex)
          }
        };
      });
      return;
    }

    setStageMap((prev) => {
      const sourceDeals = prev[sourceStageId].deals;
      const targetDeals = prev[targetStageId].deals;

      const activeIndex = sourceDeals.findIndex((d) => d.id === activeDealId);
      if (activeIndex === -1) return prev;

      const deal = sourceDeals[activeIndex];
      const newSourceDeals = sourceDeals.filter((d) => d.id !== activeDealId);

      const overIndex = targetDeals.findIndex((d) => d.id === overDealId);
      const insertAt = overIndex === -1 ? targetDeals.length : overIndex;
      const newTargetDeals = [
        ...targetDeals.slice(0, insertAt),
        deal,
        ...targetDeals.slice(insertAt)
      ];

      return {
        ...prev,
        [sourceStageId]: {
          ...prev[sourceStageId],
          deals: newSourceDeals,
          totalCount: Math.max(0, prev[sourceStageId].totalCount - 1)
        },
        [targetStageId]: {
          ...prev[targetStageId],
          deals: newTargetDeals,
          totalCount: prev[targetStageId].totalCount + 1
        }
      };
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
