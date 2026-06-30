import type { DragEndEvent, DragOverEvent } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";

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

export const applyDealMove = (
  stageMap: CrmBoardStageDealsResponseType[],
  event: DragOverEvent | DragEndEvent
): CrmBoardStageDealsResponseType[] => {
  const dealsByStage: Record<string, CrmBoardDealResponseType[]> = {};
  for (const stage of stageMap) {
    dealsByStage[getStageDroppableId(stage.stageId)] = stage.deals;
  }

  const movedDealsByStage = move(dealsByStage, event);
  if (movedDealsByStage === dealsByStage) return stageMap;

  return stageMap.map((stage) => {
    const nextDeals = movedDealsByStage[getStageDroppableId(stage.stageId)];
    if (!nextDeals || nextDeals === stage.deals) return stage;

    return {
      ...stage,
      deals: nextDeals,
      totalCount: stage.totalCount + (nextDeals.length - stage.deals.length)
    };
  });
};
