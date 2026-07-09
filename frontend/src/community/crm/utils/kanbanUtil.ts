import type { ClientRect } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type {
  CrmBoardDealNeighboursType,
  CrmBoardDealResponseType,
  CrmBoardDealSliceType,
  CrmBoardReorderResultType,
  CrmBoardStageDealsResponseType,
  CrmBoardStageDealsType
} from "~community/crm/types/BoardTypes";
import type {
  CrmContactLookup,
  CrmDealResponseType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

export const resolveBoardDeal = (
  deal: CrmBoardDealResponseType,
  stageId: number,
  owner: CrmOwner,
  contact: CrmContactLookup | undefined
): CrmBoardDealSliceType => ({
  id: deal.id,
  name: deal.name,
  contactName: contact?.name ?? "",
  companyName: contact?.company?.name ?? null,
  owner,
  amount: deal.amount,
  priority: deal.priority,
  taskCount: deal.taskCount,
  stageId
});

export const mapStageDealsToSlice = (
  stageDeals: CrmBoardStageDealsResponseType,
  owners: CrmOwner[],
  contacts: CrmContactLookup[]
): CrmBoardStageDealsType => ({
  ...stageDeals,
  deals: stageDeals.deals.map((deal) =>
    resolveBoardDeal(
      deal,
      stageDeals.stageId,
      owners.find((owner) => owner.employeeId === deal.ownerId)!,
      contacts.find((contact) => contact.id === deal.contactId)
    )
  )
});

export const mapCreatedDealToSlice = (
  deal: CrmDealResponseType
): CrmBoardDealSliceType => ({
  id: deal.id,
  name: deal.name,
  contactName: deal.contactName ?? "",
  companyName: deal.companyName,
  owner: deal.owner,
  amount: deal.amount,
  priority: deal.priority,
  taskCount: 0,
  stageId: deal.stage.id
});

export const findDealById = (
  stageMap: CrmBoardStageDealsType[],
  dealId: number
): CrmBoardDealSliceType =>
  stageMap
    .flatMap((stage) => stage?.deals)
    .find((deal) => deal?.id === dealId)!;

export const findStageIdByDealId = (
  stageMap: CrmBoardStageDealsType[],
  dealId: number
): number | null => {
  const stage = stageMap.find((stage) =>
    stage?.deals.some((deal) => deal?.id === dealId)
  );
  return stage?.stageId ?? null;
};

export const getNeighbourDealIds = (
  stageMap: CrmBoardStageDealsType[],
  stageId: number,
  dealId: number
): CrmBoardDealNeighboursType => {
  const deals =
    stageMap.find((stage) => stage.stageId === stageId)?.deals ?? [];
  const index = deals.findIndex((deal) => deal?.id === dealId);

  if (index === -1) return { previousDealId: null, nextDealId: null };

  return {
    previousDealId: deals[index - 1]?.id ?? null,
    nextDealId: deals[index + 1]?.id ?? null
  };
};

export const normalizeStageDeals = (
  stageDeals: CrmBoardStageDealsResponseType[],
  owners: CrmOwner[],
  contacts: CrmContactLookup[]
): CrmBoardStageDealsType[] =>
  stageDeals.map((stageDeal) =>
    mapStageDealsToSlice(stageDeal, owners, contacts)
  );

export const appendDealsToStageMap = (
  stageMap: CrmBoardStageDealsType[],
  stageDeals: CrmBoardStageDealsType
): CrmBoardStageDealsType[] =>
  stageMap.map((stage) =>
    stage.stageId === stageDeals.stageId
      ? { ...stageDeals, deals: [...stage.deals, ...stageDeals.deals] }
      : stage
  );

export const addDealToStageMap = (
  stageMap: CrmBoardStageDealsType[],
  deal: CrmBoardDealSliceType
): CrmBoardStageDealsType[] =>
  stageMap.map((stage) =>
    stage.stageId === deal.stageId
      ? {
          ...stage,
          deals: [...stage.deals, deal],
          totalCount: stage.totalCount + 1
        }
      : stage
  );

export const updateDealInStageMap = (
  stageMap: CrmBoardStageDealsType[],
  deal: Omit<CrmBoardDealSliceType, "taskCount">
): CrmBoardStageDealsType[] => {
  const currentStageId = findStageIdByDealId(stageMap, deal.id);
  if (currentStageId === null) return stageMap;

  const existingDeal = stageMap
    .find((stage) => stage.stageId === currentStageId)
    ?.deals.find((d) => d.id === deal.id);

  const updatedDeal: CrmBoardDealSliceType = {
    ...deal,
    taskCount: existingDeal?.taskCount ?? 0
  };

  if (currentStageId === deal.stageId)
    return stageMap.map((stage) =>
      stage.stageId === currentStageId
        ? {
            ...stage,
            deals: stage.deals.map((d) => (d.id === deal.id ? updatedDeal : d))
          }
        : stage
    );

  return stageMap.map((stage) => {
    if (stage.stageId === currentStageId)
      return {
        ...stage,
        deals: stage.deals.filter((d) => d.id !== deal.id),
        totalCount: stage.totalCount - 1
      };
    if (stage.stageId === deal.stageId)
      return {
        ...stage,
        deals: [...stage.deals, updatedDeal],
        totalCount: stage.totalCount + 1
      };
    return stage;
  });
};

export const computeReorderWithinStage = (
  sourceDeals: CrmBoardDealSliceType[],
  activeDealId: number,
  overDealId: number
): CrmBoardReorderResultType | null => {
  const activeIndex = sourceDeals.findIndex((d) => d.id === activeDealId);
  const overIndex = sourceDeals.findIndex((d) => d.id === overDealId);
  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex)
    return null;

  const reorderedDeals = arrayMove(sourceDeals, activeIndex, overIndex);
  return {
    reorderedDeals,
    previousDealId: overIndex > 0 ? reorderedDeals[overIndex - 1].id : null,
    nextDealId:
      overIndex < reorderedDeals.length - 1
        ? reorderedDeals[overIndex + 1].id
        : null
  };
};

export const applyReorderToStageMap = (
  stageMap: CrmBoardStageDealsType[],
  stageId: number,
  reorderedDeals: CrmBoardDealSliceType[]
): CrmBoardStageDealsType[] =>
  stageMap.map((stage) =>
    stage.stageId === stageId ? { ...stage, deals: reorderedDeals } : stage
  );

export const computeInsertIndex = (
  targetDeals: CrmBoardDealSliceType[],
  overDealId: number,
  activeCenterY: number | null,
  overCenterY: number | null
): number => {
  const overIndex = targetDeals.findIndex((d) => d.id === overDealId);
  if (overIndex === -1) return targetDeals.length;
  if (activeCenterY !== null && overCenterY !== null)
    return activeCenterY < overCenterY ? overIndex : overIndex + 1;
  return overIndex;
};

export const resolveInsertIndex = (
  isOverStageContainer: boolean,
  targetDeals: CrmBoardDealSliceType[],
  overDealId: number,
  activeRect: ClientRect | null,
  overRect: ClientRect | null
): number => {
  if (isOverStageContainer) return targetDeals.length;

  const activeCenterY = activeRect
    ? activeRect.top + activeRect.height / 2
    : null;
  const overCenterY = overRect ? overRect.top + overRect.height / 2 : null;

  return computeInsertIndex(
    targetDeals,
    overDealId,
    activeCenterY,
    overCenterY
  );
};

export const computeMoveNeighbors = (
  targetDeals: CrmBoardDealSliceType[],
  insertIndex: number
): CrmBoardDealNeighboursType => {
  if (targetDeals.length === 0 || insertIndex === 0)
    return { previousDealId: null, nextDealId: targetDeals[0]?.id ?? null };
  if (insertIndex >= targetDeals.length)
    return { previousDealId: targetDeals.at(-1)?.id ?? null, nextDealId: null };
  return {
    previousDealId: targetDeals[insertIndex - 1].id,
    nextDealId: targetDeals[insertIndex].id
  };
};

export const applyMoveToStageMap = (
  stageMap: CrmBoardStageDealsType[],
  sourceStageId: number,
  targetStageId: number,
  insertIndex: number,
  deal: CrmBoardDealSliceType,
  activeDealId: number
): CrmBoardStageDealsType[] =>
  stageMap.map((stage) => {
    if (stage.stageId === sourceStageId)
      return {
        ...stage,
        deals: stage.deals.filter((d) => d.id !== activeDealId),
        totalCount: stage.totalCount - 1
      };
    if (stage.stageId === targetStageId)
      return {
        ...stage,
        deals: [
          ...stage.deals.slice(0, insertIndex),
          { ...deal, stageId: targetStageId },
          ...stage.deals.slice(insertIndex)
        ],
        totalCount: stage.totalCount + 1
      };
    return stage;
  });
