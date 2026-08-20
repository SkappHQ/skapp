import { useCrmStoreV2 } from "../store/store";
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

export const toDealIds = (deals: CrmDealEntity[]): number[] => {
  const dealIds: number[] = [];
  for (const deal of deals) {
    if (deal.id != null) {
      dealIds.push(deal.id);
    }
  }
  return dealIds;
};

export const upsertDeals = (deals: CrmDealEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmDealRecord = { ...store.deals };

  for (const deal of deals) {
    if (deal.id == null) continue;
    merged[deal.id] = { ...merged[deal.id], ...deal };
  }

  store.setDeals(merged);
};

export const formatDealAmount = (amount: string | null | undefined): string => {
  if (amount == null || amount === "") return "-";
  const parsed = Number.parseFloat(amount);
  if (Number.isNaN(parsed) || parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
};

export const ingestDeals = (deals: CrmDealEntity[]): void => {
  upsertDeals(deals);
  useCrmStoreV2.getState().setDealIds(toDealIds(deals));
};

export const appendListDealId = (id: number): void => {
  const { dealIds, setDealIds } = useCrmStoreV2.getState();
  if (dealIds.includes(id)) return;
  setDealIds([...dealIds, id]);
};

export const removeListDealId = (id: number): void => {
  const { dealIds, setDealIds } = useCrmStoreV2.getState();
  if (!dealIds.includes(id)) return;
  setDealIds(dealIds.filter((dealId) => dealId !== id));
};

export const removeDealFromRecord = (id: number): void => {
  const { deals, setDeals } = useCrmStoreV2.getState();
  if (!(id in deals)) return;
  const next = { ...deals };
  delete next[id];
  setDeals(next);
};
