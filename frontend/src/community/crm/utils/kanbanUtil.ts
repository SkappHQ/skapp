import { arrayMove } from "@dnd-kit/sortable";

import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import type { KanbanStage } from "~community/crm/types/BoardTypes";
import type {
  CrmDealBoardType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

export const getAccentColor = (color: string): string =>
  STAGE_COLOR_MAP[color?.toUpperCase()];

export const findDealById = (
  stageMap: KanbanStage[],
  dealId: number
): CrmDealBoardType | null => {
  for (const stage of stageMap) {
    const deal = stage.deals.find((d) => d.id === dealId);
    if (deal) return deal;
  }
  return null;
};

export const findStageIdByDealId = (
  stageMap: KanbanStage[],
  dealId: number
): number | null => {
  const stage = stageMap.find((s) => s.deals.some((d) => d.id === dealId));
  return stage ? stage.stageId : null;
};

export const resolveTargetStageId = (
  overId: number,
  stageMap: KanbanStage[]
): number | null => {
  if (stageMap.some((s) => s.stageId === overId)) return overId;
  return findStageIdByDealId(stageMap, overId);
};

export const buildInitialStageState = (
  stages: CrmDealStageType[],
  dealsByStage: Record<number, CrmDealBoardType[]>
): KanbanStage[] =>
  stages.map((s) => ({ stageId: s.id, deals: dealsByStage[s.id] ?? [] }));

const reorderStageDeals = (
  stage: KanbanStage,
  activeDealId: number,
  overDealId: number
): KanbanStage => {
  const activeIndex = stage.deals.findIndex((d) => d.id === activeDealId);
  const overIndex = stage.deals.findIndex((d) => d.id === overDealId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return stage;
  }

  return { ...stage, deals: arrayMove(stage.deals, activeIndex, overIndex) };
};

export const reorderDealsWithinStage = (
  stageMap: KanbanStage[],
  stageId: number,
  activeDealId: number,
  overDealId: number
): KanbanStage[] =>
  stageMap.map((stage) =>
    stage.stageId === stageId
      ? reorderStageDeals(stage, activeDealId, overDealId)
      : stage
  );

const removeDealFromStage = (
  stage: KanbanStage,
  dealId: number
): KanbanStage => ({
  ...stage,
  deals: stage.deals.filter((d) => d.id !== dealId)
});

const insertDealIntoStage = (
  stage: KanbanStage,
  deal: CrmDealBoardType,
  overDealId: number
): KanbanStage => {
  const overIndex = stage.deals.findIndex((d) => d.id === overDealId);
  const insertAt = overIndex === -1 ? stage.deals.length : overIndex;

  return {
    ...stage,
    deals: [
      ...stage.deals.slice(0, insertAt),
      deal,
      ...stage.deals.slice(insertAt)
    ]
  };
};

export const moveDealBetweenStages = (
  stageMap: KanbanStage[],
  sourceStageId: number,
  targetStageId: number,
  activeDealId: number,
  overDealId: number
): KanbanStage[] => {
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
