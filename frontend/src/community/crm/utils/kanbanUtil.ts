import type { UniqueIdentifier } from "@dnd-kit/core";
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

export const applyDealMove = (
  stageMap: CrmBoardStageDealsResponseType[],
  activeId: number,
  overId: UniqueIdentifier | null,
  activeStageId: number,
  overStageId: number
): CrmBoardStageDealsResponseType[] => {
  if (activeStageId === overStageId) {
    if (overId === null) return stageMap;

    const stage = stageMap.find((stage) => stage.stageId === activeStageId);
    if (!stage) return stageMap;

    const oldIndex = stage.deals.findIndex((deal) => deal.id === activeId);
    const newIndex = stage.deals.findIndex(
      (deal) => deal.id === Number(overId)
    );

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
      return stageMap;

    const reordered = arrayMove(stage.deals, oldIndex, newIndex);
    return stageMap.map((stage) =>
      stage.stageId === activeStageId ? { ...stage, deals: reordered } : stage
    );
  }

  const deal = stageMap
    .flatMap((stage) => stage.deals)
    .find((deal) => deal.id === activeId);
  if (!deal) return stageMap;

  const overStage = stageMap.find((stage) => stage.stageId === overStageId);
  if (!overStage) return stageMap;

  const overCardIndex =
    overId === null
      ? -1
      : overStage.deals.findIndex((deal) => deal.id === Number(overId));
  const insertAt =
    overCardIndex === -1 ? overStage.deals.length : overCardIndex;

  return stageMap.map((stage) => {
    if (stage.stageId === activeStageId)
      return {
        ...stage,
        deals: stage.deals.filter((deal) => deal.id !== activeId),
        totalCount: stage.totalCount - 1
      };
    if (stage.stageId === overStageId)
      return {
        ...stage,
        deals: [
          ...stage.deals.slice(0, insertAt),
          deal,
          ...stage.deals.slice(insertAt)
        ],
        totalCount: stage.totalCount + 1
      };
    return stage;
  });
};
