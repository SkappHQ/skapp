import { useCrmStoreV2 } from "../store/store";
import { CrmDealEntity, CrmDealRecord } from "../types/CrmCommonTypes";

// Deal helpers for the v2 (normalized store) deal module.
//
// The /v2/crm/deal payload is already scalar (stageId/ownerId/companyId/
// contactId), i.e. identical to the store's CrmDealEntity. So normalization is
// just indexing the deals by id and preserving their order — no nested entities
// to split out. The related stage/owner/company/contact records are loaded once
// from their own lookup / reference endpoints, not from the deal response.

// Indexes a list of deals into an id-keyed record for the normalized store.
export const toDealsRecord = (deals: CrmDealEntity[]): CrmDealRecord => {
  const dealRecord: CrmDealRecord = {};
  for (const deal of deals) {
    if (deal.id != null) {
      dealRecord[deal.id] = deal;
    }
  }
  return dealRecord;
};

// Ordered list of ids for the deals that make it into the record.
export const toDealIds = (deals: CrmDealEntity[]): number[] => {
  const dealIds: number[] = [];
  for (const deal of deals) {
    if (deal.id != null) {
      dealIds.push(deal.id);
    }
  }
  return dealIds;
};

// Merges deals into the store's `deals` record by id, so a partial deal (e.g. a
// slim board card carrying only id/name/amount/priority/ownerId/companyId/
// contactId + task count) and a full deal (list/detail, carrying description/
// orderIndex/closingAt/stageId) enrich the SAME object rather than clobbering
// each other. Reads getState() at call time so writes merge against fresh store
// state (no stale-closure clobbering). Does not touch any ordering array.
export const upsertDeals = (deals: CrmDealEntity[]): void => {
  const store = useCrmStoreV2.getState();
  const merged: CrmDealRecord = { ...store.deals };

  for (const deal of deals) {
    if (deal.id == null) continue;
    merged[deal.id] = { ...merged[deal.id], ...deal };
  }

  store.setDeals(merged);
};

// Centralized deal amount formatting. Kept in one place so the multi-currency
// epic can swap it out with a single change (see multiCurrentPlan.md).
export const formatDealAmount = (amount: string | null | undefined): string => {
  if (amount == null || amount === "") return "-";
  const parsed = Number.parseFloat(amount);
  if (Number.isNaN(parsed) || parsed === 0) return "-";
  return `$${parsed.toFixed(2)}`;
};

// List ingestion: merge the page's deals into the record and replace the list
// ordering. The board keeps its own per-column ordering (board[stageId].dealIds)
// and so does not go through here.
export const ingestDeals = (deals: CrmDealEntity[]): void => {
  upsertDeals(deals);
  useCrmStoreV2.getState().setDealIds(toDealIds(deals));
};

// Append a deal id to the list ordering (dedup) — used when a new deal is
// created while the list view is active.
export const appendListDealId = (id: number): void => {
  const { dealIds, setDealIds } = useCrmStoreV2.getState();
  if (dealIds.includes(id)) return;
  setDealIds([...dealIds, id]);
};

// Drop a deal id from the list ordering.
export const removeListDealId = (id: number): void => {
  const { dealIds, setDealIds } = useCrmStoreV2.getState();
  if (!dealIds.includes(id)) return;
  setDealIds(dealIds.filter((dealId) => dealId !== id));
};

// Remove a deal from the shared record entirely.
export const removeDealFromRecord = (id: number): void => {
  const { deals, setDeals } = useCrmStoreV2.getState();
  if (!(id in deals)) return;
  const next = { ...deals };
  delete next[id];
  setDeals(next);
};
