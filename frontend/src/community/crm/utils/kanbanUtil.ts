import { arrayMove } from "@dnd-kit/sortable";

import type { CrmBoardDealType, CrmBoardStage } from "~community/crm/types/BoardTypes";
import type { CrmDealStageType } from "~community/crm/types/CommonTypes";

export const findDealById = (
  stageMap: CrmBoardStage[],
  dealId: number
): CrmBoardDealType =>
  stageMap
    .flatMap((stage) => stage?.deals)
    .find((deal) => deal?.id === dealId)!;

export const findStageIdByDealId = (
  stageMap: CrmBoardStage[],
  dealId: number
): number | null => {
  const stage = stageMap.find((stage) =>
    stage?.deals.some((deal) => deal?.id === dealId)
  );
  return stage?.stageId ?? null;
};

export const resolveTargetStageId = (
  overId: number,
  stageMap: CrmBoardStage[]
): number | null => {
  if (stageMap.some((stage) => stage?.stageId === overId)) return overId;
  return findStageIdByDealId(stageMap, overId);
};

export const buildInitialBoardStages = (
  stages: CrmDealStageType[],
  dealsByStage: Record<number, CrmBoardDealType[]>
): CrmBoardStage[] =>
  stages.map((stage) => ({
    stageId: stage?.id,
    deals: dealsByStage[stage?.id] ?? []
  }));

const reorderStageDeals = (
  stage: CrmBoardStage,
  activeDealId: number,
  overDealId: number
): CrmBoardStage => {
  const activeIndex = stage?.deals.findIndex(
    (deal) => deal?.id === activeDealId
  );
  const overIndex = stage?.deals.findIndex((deal) => deal?.id === overDealId);

  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return stage;
  }

  return { ...stage, deals: arrayMove(stage.deals, activeIndex, overIndex) };
};

export const reorderDealsWithinStage = (
  stageMap: CrmBoardStage[],
  stageId: number,
  activeDealId: number,
  overDealId: number
): CrmBoardStage[] =>
  stageMap.map((stage) =>
    stage.stageId === stageId
      ? reorderStageDeals(stage, activeDealId, overDealId)
      : stage
  );

const removeDealFromStage = (
  stage: CrmBoardStage,
  dealId: number
): CrmBoardStage => ({
  ...stage,
  deals: stage.deals.filter((deal) => deal?.id !== dealId)
});

const insertDealIntoStage = (
  stage: CrmBoardStage,
  deal: CrmBoardDealType,
  overDealId: number
): CrmBoardStage => {
  const overIndex = stage.deals.findIndex((deal) => deal?.id === overDealId);
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
  stageMap: CrmBoardStage[],
  sourceStageId: number,
  targetStageId: number,
  activeDealId: number,
  overDealId: number
): CrmBoardStage[] => {
  const sourceStage = stageMap.find(
    (stage) => stage?.stageId === sourceStageId
  );

  if (!sourceStage) return stageMap;

  const activeIndex = sourceStage.deals.findIndex(
    (deal) => deal?.id === activeDealId
  );

  if (activeIndex === -1) return stageMap;

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
