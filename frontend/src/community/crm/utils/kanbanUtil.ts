import { arrayMove } from "@dnd-kit/sortable";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type { StageMap, StageState } from "~community/crm/types/BoardTypes";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

export const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

export const findDealById = (
  stageMap: StageMap,
  dealId: number
): CrmDealBoardType | null => {
  for (const stage of stageMap) {
    const deal = stage.deals.find((d) => d.id === dealId);
    if (deal) return deal;
  }
  return null;
};

export const findStageIdByDealId = (
  stageMap: StageMap,
  dealId: number
): number | null => {
  const stage = stageMap.find((s) => s.deals.some((d) => d.id === dealId));
  return stage ? stage.stageId : null;
};

export const resolveTargetStageId = (
  overId: number,
  stageMap: StageMap
): number | null => {
  if (stageMap.some((s) => s.stageId === overId)) return overId;
  return findStageIdByDealId(stageMap, overId);
};

export const buildInitialStageState = (
  stages: CrmDealStageType[],
  dealsByStage: Record<number, CrmDealBoardType[]>
): StageMap =>
  stages.map((s) => {
    const deals = dealsByStage[s.id] ?? [];
    return { stageId: s.id, deals, totalCount: deals.length };
  });

const reorderStageDeals = (
  stage: StageState,
  activeDealId: number,
  overDealId: number
): StageState => {
  const activeIndex = stage.deals.findIndex((d) => d.id === activeDealId);
  const overIndex = stage.deals.findIndex((d) => d.id === overDealId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return stage;
  }

  return { ...stage, deals: arrayMove(stage.deals, activeIndex, overIndex) };
};

export const reorderDealsWithinStage = (
  stageMap: StageMap,
  stageId: number,
  activeDealId: number,
  overDealId: number
): StageMap =>
  stageMap.map((stage) =>
    stage.stageId === stageId
      ? reorderStageDeals(stage, activeDealId, overDealId)
      : stage
  );

const removeDealFromStage = (
  stage: StageState,
  dealId: number
): StageState => ({
  ...stage,
  deals: stage.deals.filter((d) => d.id !== dealId),
  totalCount: Math.max(0, stage.totalCount - 1)
});

const insertDealIntoStage = (
  stage: StageState,
  deal: CrmDealBoardType,
  overDealId: number
): StageState => {
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
};

export const moveDealBetweenStages = (
  stageMap: StageMap,
  sourceStageId: number,
  targetStageId: number,
  activeDealId: number,
  overDealId: number
): StageMap => {
  const sourceStage = stageMap.find((s) => s.stageId === sourceStageId);
  const activeIndex = sourceStage?.deals.findIndex(
    (d) => d.id === activeDealId
  );

  if (!sourceStage || activeIndex === undefined || activeIndex === -1) {
    return stageMap;
  }

  const deal = sourceStage.deals[activeIndex];

  return stageMap.map((stage) => {
    if (stage.stageId === sourceStageId) {
      return removeDealFromStage(stage, activeDealId);
    }
    if (stage.stageId === targetStageId) {
      return insertDealIntoStage(stage, deal, overDealId);
    }
    return stage;
  });
};
