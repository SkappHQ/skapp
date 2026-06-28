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

// Deal ids and stage ids come from separate sequences and can collide
// numerically (e.g. deal #3 and stage #3). dnd-kit's `move()` resolves a drop
// target by first scanning every group's items for a matching id before
// falling back to treating it as a group key - so the stage-lane droppable's
// id must never be a bare number that could be mistaken for some deal's id.
// This namespacing is the only thing that makes that fallback path reliable
// for empty (or about-to-be-emptied) lanes; keep `applyDealMove`'s record
// keys in the same format.
export const getStageDroppableId = (stageId: number): string =>
  `stage-${stageId}`;

// The grouped-deals API only returns an entry for stages that have at least
// one matching deal, so a stage with zero deals has no key in `boardStageDeals`
// at all. Rendering tolerates that with a `?? []` fallback, but `applyDealMove`
// needs every stage present to register it as a valid drop target - otherwise
// dropping onto an empty stage silently no-ops. This fills in the missing ones.
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

// Delegates the actual reorder/cross-stage-splice math to dnd-kit's own
// `move()` helper (battle-tested against the engine's tracked shapes/indices)
// instead of hand-rolled rect comparisons. `totalCount` per stage is kept in
// sync since `move()` only knows about the plain deals arrays.
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
