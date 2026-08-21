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
  taskCount: deal.taskCount,
  stageId
});

const toColumn = (group: CrmDealsByStagesResponse): CrmBoardColumn => ({
  dealIds: group.deals.map((deal) => deal.id),
  totalCount: group.totalCount,
  currentPage: group.currentPage,
  hasNextPage: group.hasNextPage
});

const appendDealIds = (existing: number[], incoming: number[]): number[] => {
  const seen = new Set(existing);
  return [...existing, ...incoming.filter((id) => !seen.has(id))];
};

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

  const incomingIds = entities
    .map((deal) => deal.id)
    .filter((id): id is number => id != null);
  store.setDealIds(
    append
      ? appendDealIds(useCrmStoreV2.getState().dealIds, incomingIds)
      : incomingIds
  );
};

export const findStageIdByDealId = (
  board: CrmBoardRecord,
  dealId: number
): number | null => {
  for (const [key, column] of Object.entries(board)) {
    if (column.dealIds.includes(dealId)) return Number(key);
  }
  return null;
};

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
