import {
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord,
  CrmStageEntity,
  CrmStageRecord
} from "../types/CrmCommonTypes";

export interface ResolvedDealRelations {
  owner: CrmOwnerEntity | undefined;
  stage: CrmStageEntity | undefined;
}

export const resolveDealRelations = (
  deal: CrmDealEntity | undefined,
  owners: CrmOwnerRecord,
  stages: CrmStageRecord
): ResolvedDealRelations => ({
  owner: deal?.ownerId != null ? owners[deal.ownerId] : undefined,
  stage: deal?.stageId != null ? stages[deal.stageId] : undefined
});

export const getSelectedDeal = (
  deals: CrmDealRecord,
  dealId: number | undefined
): CrmDealEntity | undefined => {
  if (dealId === undefined) return undefined;

  return deals[dealId];
};

export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id != null) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
};

export const getMissingDealIds = (
  dealIds: number[],
  deals: CrmDealRecord
): number[] => {
  const unique = new Set<number>();
  for (const id of dealIds) {
    if (!deals[id]) unique.add(id);
  }
  return Array.from(unique).sort((a, b) => a - b);
};

export const toDealIds = (deals: CrmDealEntity[]): number[] => {
  const dealIds: number[] = [];
  for (const deal of deals) {
    if (deal.id != null) {
      dealIds.push(deal.id);
    }
  }
  return dealIds;
};

export const mergeDeals = (
  existing: CrmDealRecord,
  incoming: CrmDealEntity[]
): CrmDealRecord => {
  const merged: CrmDealRecord = { ...existing };
  for (const deal of incoming) {
    if (deal.id == null) continue;
    merged[deal.id] = { ...merged[deal.id], ...deal };
  }
  return merged;
};

export const appendDealId = (dealIds: number[], id: number): number[] =>
  dealIds.includes(id) ? dealIds : [...dealIds, id];

export const removeDealId = (dealIds: number[], id: number): number[] =>
  dealIds.filter((dealId) => dealId !== id);

export const removeDealFromRecord = (
  deals: CrmDealRecord,
  id: number
): CrmDealRecord => {
  if (!(id in deals)) return deals;
  const next = { ...deals };
  delete next[id];
  return next;
};

export const resolveDeals = (
  dealIds: number[],
  deals: CrmDealRecord
): CrmDealEntity[] =>
  dealIds
    .map((id) => deals[id])
    .filter((deal): deal is CrmDealEntity => Boolean(deal));
