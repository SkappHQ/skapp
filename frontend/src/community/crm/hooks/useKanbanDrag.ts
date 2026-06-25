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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRef, useState } from "react";

import type { StageMap } from "~community/crm/types/BoardTypes";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

import {
  buildInitialStageState,
  findDealById,
  findStageIdByDealId,
  moveDealBetweenStages,
  reorderDealsWithinStage,
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

  const handleDragStart = ({ active }: DragStartEvent): void => {
    const deal = findDealById(stageMap, Number(active.id));

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
    const sourceStageId = findStageIdByDealId(stageMap, activeDealId);
    const targetStageId = resolveTargetStageId(overDealId, stageMap);

    if (sourceStageId === null || targetStageId === null) return;

    setOverStageId(targetStageId);

    if (sourceStageId === targetStageId) {
      setStageMap((prev) =>
        reorderDealsWithinStage(prev, sourceStageId, activeDealId, overDealId)
      );
      return;
    }

    setStageMap((prev) =>
      moveDealBetweenStages(
        prev,
        sourceStageId,
        targetStageId,
        activeDealId,
        overDealId
      )
    );
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
