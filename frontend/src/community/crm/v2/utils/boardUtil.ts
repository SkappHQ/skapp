import { useCrmStoreV2 } from "../store/store";
import {
  CrmBoardColumn,
  CrmBoardRecord,
  CrmDealEntity
} from "../types/CrmCommonTypes";
import {
  CrmBoardDealResponse,
  CrmDealsByStagesResponse
} from "../types/CrmTypes";
import { upsertDeals } from "./dealUtil";

// Board (Kanban) helpers for the v2 normalized store.
//
// The board never stores deal objects — each column keeps only ordered
// `dealIds`, and the cards resolve against the shared `deals`/`owners`/
// `contacts`/`companies` records at render. Every write is a read-modify-write
// over the coarse `setBoardColumn` setter, which replaces the WHOLE `board`
// record, so each helper computes the next board and sets it in one shot.

// Slim scalar board card -> store entity. Stamps the stageId (implied by the
// group, absent on the wire) and folds taskCount into openTasksCount. Fields the
// board omits (description/orderIndex/closingAt) are left undefined so a
// merge-by-id upsert preserves them from an existing full deal.
export const mapBoardDealToEntity = (
  deal: CrmBoardDealResponse,
  stageId: number
): CrmDealEntity => ({
  id: deal.id,
  name: deal.name,
  amount: deal.amount ?? undefined,
  priority: deal.priority,
  ownerId: deal.ownerId,
  companyId: deal.companyId ?? undefined,
  contactId: deal.contactId,
  openTasksCount: deal.taskCount,
  stageId
});

const toColumn = (group: CrmDealsByStagesResponse): CrmBoardColumn => ({
  dealIds: group.deals.map((deal) => deal.id),
  totalCount: group.totalCount,
  currentPage: group.currentPage,
  hasNextPage: group.hasNextPage
});

// Merge new ids after the existing ones, dropping any already present (paginated
// pages can overlap).
const appendDealIds = (existing: number[], incoming: number[]): number[] => {
  const seen = new Set(existing);
  return [...existing, ...incoming.filter((id) => !seen.has(id))];
};

// Ingest one or more stage groups. `append: false` (default) replaces each
// column (first page / filter change); `append: true` appends to the existing
// column's ids and refreshes its pagination meta (load-more).
export const ingestBoardStageDeals = (
  groups: CrmDealsByStagesResponse[],
  { append = false }: { append?: boolean } = {}
): void => {
  const store = useCrmStoreV2.getState();

  const entities: CrmDealEntity[] = groups.flatMap((group) =>
    group.deals.map((deal) => mapBoardDealToEntity(deal, group.stageId))
  );
  upsertDeals(entities);

  const nextBoard: CrmBoardRecord = { ...store.board };
  for (const group of groups) {
    const incoming = toColumn(group);
    const existing = nextBoard[group.stageId];
    nextBoard[group.stageId] =
      append && existing
        ? { ...incoming, dealIds: appendDealIds(existing.dealIds, incoming.dealIds) }
        : incoming;
  }
  store.setBoardColumn(nextBoard);

  // Keep the flat `dealIds` ordering (what the list/table view reads) filled from
  // the same load, so `dealIds` is the single thing the UI renders and switching
  // to the list view needs no refetch. A full board load (append: false) replaces
  // it with the board's flattened stage order; a per-stage load-more (append:
  // true) appends the new ids (deduped).
  const incomingIds = entities
    .map((deal) => deal.id)
    .filter((id): id is number => id != null);
  store.setDealIds(
    append ? appendDealIds(store.dealIds, incomingIds) : incomingIds
  );
};

// Which stage column currently holds a given deal id (null if none).
export const findStageIdByDealId = (
  board: CrmBoardRecord,
  dealId: number
): number | null => {
  for (const [key, column] of Object.entries(board)) {
    if (column.dealIds.includes(dealId)) return Number(key);
  }
  return null;
};

// Replace a single column's ordering (optimistic reorder within a stage).
export const reorderDealInColumn = (
  stageId: number,
  orderedDealIds: number[]
): void => {
  const { board, setBoardColumn } = useCrmStoreV2.getState();
  const column = board[stageId];
  if (!column) return;
  setBoardColumn({
    ...board,
    [stageId]: { ...column, dealIds: orderedDealIds }
  });
};

// Move a deal across two columns at `insertIndex` (optimistic cross-stage move).
// Splices the id out of the source column and into the target, adjusts both
// totals, and restamps the deal's stageId in the shared record.
export const moveDealBetweenColumns = ({
  dealId,
  fromStageId,
  toStageId,
  insertIndex
}: {
  dealId: number;
  fromStageId: number;
  toStageId: number;
  insertIndex: number;
}): void => {
  if (fromStageId === toStageId) {
    return;
  }
  const { board, deals, setBoardColumn, setDeals } = useCrmStoreV2.getState();
  const from = board[fromStageId];
  const to = board[toStageId];
  if (!from || !to) return;

  const fromDealIds = from.dealIds.filter((id) => id !== dealId);
  const toDealIds = [
    ...to.dealIds.slice(0, insertIndex),
    dealId,
    ...to.dealIds.slice(insertIndex)
  ];

  setBoardColumn({
    ...board,
    [fromStageId]: {
      ...from,
      dealIds: fromDealIds,
      totalCount: Math.max(0, from.totalCount - 1)
    },
    [toStageId]: { ...to, dealIds: toDealIds, totalCount: to.totalCount + 1 }
  });

  const deal = deals[dealId];
  if (deal && deal.stageId !== toStageId) {
    setDeals({ ...deals, [dealId]: { ...deal, stageId: toStageId } });
  }
};

// Add a freshly created deal to its stage column (id appended to the end).
// Upserts the deal into the shared record first so the card can resolve.
export const addDealToColumn = (deal: CrmDealEntity): void => {
  if (deal.id == null || deal.stageId == null) return;
  upsertDeals([deal]);

  const { board, setBoardColumn } = useCrmStoreV2.getState();
  const column = board[deal.stageId];
  if (!column || column.dealIds.includes(deal.id)) return;
  setBoardColumn({
    ...board,
    [deal.stageId]: {
      ...column,
      dealIds: [...column.dealIds, deal.id],
      totalCount: column.totalCount + 1
    }
  });
};

// Drop a deal id from whichever column holds it (board-only; removing it from
// the shared `deals` record is a separate deal-level concern).
export const removeDealFromBoard = (dealId: number): void => {
  const { board, setBoardColumn } = useCrmStoreV2.getState();
  let changed = false;
  const nextBoard: CrmBoardRecord = {};

  for (const [key, column] of Object.entries(board)) {
    const stageId = Number(key);
    if (column.dealIds.includes(dealId)) {
      nextBoard[stageId] = {
        ...column,
        dealIds: column.dealIds.filter((id) => id !== dealId),
        totalCount: Math.max(0, column.totalCount - 1)
      };
      changed = true;
    } else {
      nextBoard[stageId] = column;
    }
  }

  if (changed) setBoardColumn(nextBoard);
};
