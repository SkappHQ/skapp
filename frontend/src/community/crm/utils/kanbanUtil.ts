import { arrayMove } from "@dnd-kit/sortable";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type {
  BoardMoveBetweenStagesPayload,
  BoardReorderWithinStagePayload,
  CrmDealBoardType
} from "~community/crm/types/CommonTypes";

export interface StageState {
  deals: CrmDealBoardType[];
  totalCount: number;
}

export type StageMap = Record<number, StageState>;

export type SetStageMap = (fn: (prev: StageMap) => StageMap) => void;

export const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

export const resolveTargetStageId = (
  overId: string,
  stageMap: StageMap
): number | null => {
  const overIdNum = Number(overId);

  if (stageMap[overIdNum] !== undefined) return overIdNum;

  for (const [sid, state] of Object.entries(stageMap)) {
    if (state.deals.some((d) => d.id === overIdNum)) return Number(sid);
  }

  return null;
};

export const buildInitialStageState = (
  data: Array<{
    stageId: number;
    deals: CrmDealBoardType[];
    totalCount: number;
  }>
): StageMap =>
  Object.fromEntries(
    data.map((s) => [
      s.stageId,
      {
        deals: s.deals,
        totalCount: s.totalCount
      }
    ])
  );

export interface CrossStageMoveParams {
  activeDealId: number;
  deal: CrmDealBoardType;
  overId: string;
  sourceStageId: number;
  targetStageId: number;
  srcState: StageState;
  tgtState: StageState;
  activeMidY: number;
  overMidY: number;
  setStageMap: SetStageMap;
  moveBetweenStages: (payload: BoardMoveBetweenStagesPayload) => void;
}

export const commitCrossStageMove = ({
  activeDealId,
  deal,
  overId,
  sourceStageId,
  targetStageId,
  srcState,
  tgtState,
  activeMidY,
  overMidY,
  setStageMap,
  moveBetweenStages
}: CrossStageMoveParams): void => {
  const tgtDeals = tgtState.deals.filter((d) => d.id !== activeDealId);

  const overDealIndex = tgtDeals.findIndex((d) => d.id === Number(overId));

  let insertIndex: number;
  if (overDealIndex === -1) {
    insertIndex = tgtDeals.length;
  } else {
    insertIndex = activeMidY < overMidY ? overDealIndex : overDealIndex + 1;
  }

  const newTgtDeals = [
    ...tgtDeals.slice(0, insertIndex),
    deal,
    ...tgtDeals.slice(insertIndex)
  ];

  setStageMap((prev) => ({
    ...prev,
    [sourceStageId]: {
      ...prev[sourceStageId],
      deals: srcState.deals.filter((d) => d.id !== activeDealId),
      totalCount: Math.max(0, prev[sourceStageId].totalCount - 1)
    },
    [targetStageId]: {
      ...prev[targetStageId],
      deals: newTgtDeals,
      totalCount: prev[targetStageId].totalCount + 1
    }
  }));

  moveBetweenStages({
    dealId: activeDealId,
    newStageId: targetStageId,
    previousDealId: newTgtDeals[insertIndex - 1]?.id ?? null,
    nextDealId: newTgtDeals[insertIndex + 1]?.id ?? null
  });
};

export interface SameStageReorderParams {
  activeDealId: number;
  sourceStageId: number;
  overId: string;
  srcDeals: CrmDealBoardType[];
  setStageMap: SetStageMap;
  reorderWithinStage: (payload: BoardReorderWithinStagePayload) => void;
}

export const commitSameStageReorder = ({
  activeDealId,
  sourceStageId,
  overId,
  srcDeals,
  setStageMap,
  reorderWithinStage
}: SameStageReorderParams): void => {
  if (!overId) return;

  const overDealId = Number(overId);
  const activeIndex = srcDeals.findIndex((d) => d.id === activeDealId);
  const overIndex = srcDeals.findIndex((d) => d.id === overDealId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
    return;

  const reordered = arrayMove(srcDeals, activeIndex, overIndex);

  setStageMap((prev) => ({
    ...prev,
    [sourceStageId]: { ...prev[sourceStageId], deals: reordered }
  }));

  reorderWithinStage({
    dealId: activeDealId,
    previousDealId: reordered[overIndex - 1]?.id ?? null,
    nextDealId: reordered[overIndex + 1]?.id ?? null
  });
};
