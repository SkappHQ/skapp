import { arrayMove } from "@dnd-kit/sortable";

import type {
  CrmBoardDealResponseType,
  CrmBoardDealType,
  CrmBoardStageDealsResponseType
} from "~community/crm/types/BoardTypes";
import type {
  CrmContactLookup,
  CrmDealStageType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

export const resolveBoardDeal = (
  deal: CrmBoardDealResponseType,
  owners: CrmOwner[],
  contacts: CrmContactLookup[]
): CrmBoardDealType => {
  const owner = owners.find((owner) => owner.employeeId === deal.ownerId)!;
  const contact = contacts.find((contact) => contact.id === deal.contactId);

  return {
    id: deal.id,
    name: deal.name,
    contactName: contact?.name ?? "",
    companyName: contact?.company?.name ?? null,
    owner,
    amount: deal.amount,
    priority: deal.priority,
    taskCount: deal.taskCount
  };
};

export const findDealById = (
  stageMap: CrmBoardStageDealsResponseType[],
  dealId: number
): CrmBoardDealResponseType =>
  stageMap
    .flatMap((stage) => stage?.deals)
    .find((deal) => deal?.id === dealId)!;

export const findStageIdByDealId = (
  stageMap: CrmBoardStageDealsResponseType[],
  dealId: number
): number | null => {
  const stage = stageMap.find((stage) =>
    stage?.deals.some((deal) => deal?.id === dealId)
  );
  return stage?.stageId ?? null;
};

export const getNeighbourDealIds = (
  stageMap: CrmBoardStageDealsResponseType[],
  stageId: number,
  dealId: number
): { previousDealId: number | null; nextDealId: number | null } => {
  const deals =
    stageMap.find((stage) => stage.stageId === stageId)?.deals ?? [];
  const index = deals.findIndex((deal) => deal?.id === dealId);

  if (index === -1) return { previousDealId: null, nextDealId: null };

  return {
    previousDealId: deals[index - 1]?.id ?? null,
    nextDealId: deals[index + 1]?.id ?? null
  };
};

export const getStageDroppableId = (stageId: number): string =>
  `stage-${stageId}`;

export const normalizeStageDeals = (
  stages: CrmDealStageType[],
  stageDeals: CrmBoardStageDealsResponseType[]
): CrmBoardStageDealsResponseType[] =>
  stages.map(
    (stage) =>
      stageDeals.find((stageDeal) => stageDeal.stageId === stage.id) ?? {
        stageId: stage.id,
        deals: [],
        totalCount: 0,
        currentPage: 0,
        totalPages: 0,
        pageSize: 0,
        hasNextPage: false
      }
  );

export const computeReorderWithinStage = (
  sourceDeals: CrmBoardDealResponseType[],
  activeDealId: number,
  overDealId: number
): {
  reorderedDeals: CrmBoardDealResponseType[];
  previousDealId: number | null;
  nextDealId: number | null;
} | null => {
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
  stageMap: CrmBoardStageDealsResponseType[],
  stageId: number,
  reorderedDeals: CrmBoardDealResponseType[]
): CrmBoardStageDealsResponseType[] =>
  stageMap.map((stage) =>
    stage.stageId === stageId ? { ...stage, deals: reorderedDeals } : stage
  );

export const computeInsertIndex = (
  targetDeals: CrmBoardDealResponseType[],
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

export const computeMoveNeighbors = (
  targetDeals: CrmBoardDealResponseType[],
  insertIndex: number
): { previousDealId: number | null; nextDealId: number | null } => {
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
  stageMap: CrmBoardStageDealsResponseType[],
  sourceStageId: number,
  targetStageId: number,
  insertIndex: number,
  deal: CrmBoardDealResponseType,
  activeDealId: number
): CrmBoardStageDealsResponseType[] =>
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
          deal,
          ...stage.deals.slice(insertIndex)
        ],
        totalCount: stage.totalCount + 1
      };
    return stage;
  });
