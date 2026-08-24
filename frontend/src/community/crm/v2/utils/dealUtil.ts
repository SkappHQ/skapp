import { CrmDealEntity, CrmDealRecord } from "../types/CrmCommonTypes";

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
    if (id != null && !deals[id]) unique.add(id);
  }
  return Array.from(unique).sort((a, b) => a - b);
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
