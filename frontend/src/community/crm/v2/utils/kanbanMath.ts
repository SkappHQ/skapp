import type { ClientRect } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export interface CrmBoardNeighbours {
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmBoardReorderResult extends CrmBoardNeighbours {
  orderedDealIds: number[];
}

export const computeReorderWithinStage = (
  dealIds: number[],
  activeDealId: number,
  overDealId: number
): CrmBoardReorderResult | null => {
  const activeIndex = dealIds.indexOf(activeDealId);
  const overIndex = dealIds.indexOf(overDealId);
  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return null;
  }

  const orderedDealIds = arrayMove(dealIds, activeIndex, overIndex);
  return {
    orderedDealIds,
    previousDealId: overIndex > 0 ? orderedDealIds[overIndex - 1] : null,
    nextDealId:
      overIndex < orderedDealIds.length - 1
        ? orderedDealIds[overIndex + 1]
        : null
  };
};

export const computeInsertIndex = (
  targetDealIds: number[],
  overDealId: number,
  activeCenterY: number | null,
  overCenterY: number | null
): number => {
  const overIndex = targetDealIds.indexOf(overDealId);
  if (overIndex === -1) return targetDealIds.length;
  if (activeCenterY !== null && overCenterY !== null) {
    return activeCenterY < overCenterY ? overIndex : overIndex + 1;
  }
  return overIndex;
};

export const resolveInsertIndex = (
  isOverStageContainer: boolean,
  targetDealIds: number[],
  overDealId: number,
  activeRect: ClientRect | null,
  overRect: ClientRect | null
): number => {
  if (isOverStageContainer) return targetDealIds.length;

  const activeCenterY = activeRect
    ? activeRect.top + activeRect.height / 2
    : null;
  const overCenterY = overRect ? overRect.top + overRect.height / 2 : null;

  return computeInsertIndex(
    targetDealIds,
    overDealId,
    activeCenterY,
    overCenterY
  );
};

export const computeMoveNeighbors = (
  targetDealIds: number[],
  insertIndex: number
): CrmBoardNeighbours => {
  if (targetDealIds.length === 0 || insertIndex === 0) {
    return { previousDealId: null, nextDealId: targetDealIds[0] ?? null };
  }
  if (insertIndex >= targetDealIds.length) {
    return { previousDealId: targetDealIds.at(-1) ?? null, nextDealId: null };
  }
  return {
    previousDealId: targetDealIds[insertIndex - 1],
    nextDealId: targetDealIds[insertIndex]
  };
};
