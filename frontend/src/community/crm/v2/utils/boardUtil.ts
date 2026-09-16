import type { ClientRect } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import {
  CrmBoardColumn,
  CrmBoardRecord,
  CrmCompanyEntity,
  CrmCompanyRecord,
  CrmContactEntity,
  CrmContactRecord,
  CrmDealEntity,
  CrmDealRecord,
  CrmOwnerEntity,
  CrmOwnerRecord
} from "../types/CrmCommonTypes";
import { CrmDealsByStagesResponse } from "../types/CrmTypes";
import { appendId } from "./commonUtil";
import { mergeDeals, removeDealFromRecord, removeDealId } from "./dealUtil";

const appendDealIds = (existing: number[], incoming: number[]): number[] => {
  const seen = new Set(existing);
  return [...existing, ...incoming.filter((id) => !seen.has(id))];
};

export const ingestBoardStageDeals = (
  current: {
    deals: CrmDealRecord;
    board: CrmBoardRecord;
    dealIds: number[];
  },
  groups: CrmDealsByStagesResponse[],
  { append = false }: { append?: boolean } = {}
): { deals: CrmDealRecord; board: CrmBoardRecord; dealIds: number[] } => {
  const entities: CrmDealEntity[] = groups.flatMap((group) =>
    group.deals.map((deal) => ({ ...deal, stageId: group.stageId }))
  );
  const deals = mergeDeals(current.deals, entities);

  const board: CrmBoardRecord = { ...current.board };
  for (const group of groups) {
    const incoming: CrmBoardColumn = {
      dealIds: group.deals
        .map((deal) => deal.id)
        .filter((id): id is number => id != null),
      totalCount: group.totalCount,
      currentPage: group.currentPage,
      hasNextPage: group.hasNextPage
    };
    const existing = board[group.stageId];
    board[group.stageId] =
      append && existing
        ? {
            ...incoming,
            dealIds: appendDealIds(existing.dealIds, incoming.dealIds)
          }
        : incoming;
  }

  const incomingIds = entities
    .map((deal) => deal.id)
    .filter((id): id is number => id != null);
  const dealIds = append
    ? appendDealIds(current.dealIds, incomingIds)
    : incomingIds;

  return { deals, board, dealIds };
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
  board: CrmBoardRecord,
  stageId: number,
  orderedDealIds: number[]
): CrmBoardRecord => {
  const column = board[stageId];
  if (!column) return board;
  return { ...board, [stageId]: { ...column, dealIds: orderedDealIds } };
};

export const moveDealBetweenColumns = (
  current: { board: CrmBoardRecord; deals: CrmDealRecord },
  {
    dealId,
    fromStageId,
    toStageId,
    insertIndex
  }: {
    dealId: number;
    fromStageId: number;
    toStageId: number;
    insertIndex: number;
  }
): { board: CrmBoardRecord; deals: CrmDealRecord } => {
  const { board, deals } = current;
  if (fromStageId === toStageId) return { board, deals };

  const from = board[fromStageId];
  const to = board[toStageId];
  if (!from || !to) return { board, deals };

  const fromDealIds = from.dealIds.filter((id) => id !== dealId);
  const toDealIds = [
    ...to.dealIds.slice(0, insertIndex),
    dealId,
    ...to.dealIds.slice(insertIndex)
  ];

  const nextBoard: CrmBoardRecord = {
    ...board,
    [fromStageId]: {
      ...from,
      dealIds: fromDealIds,
      totalCount: Math.max(0, from.totalCount - 1)
    },
    [toStageId]: { ...to, dealIds: toDealIds, totalCount: to.totalCount + 1 }
  };

  const deal = deals[dealId];
  const nextDeals =
    deal && deal.stageId !== toStageId
      ? { ...deals, [dealId]: { ...deal, stageId: toStageId } }
      : deals;

  return { board: nextBoard, deals: nextDeals };
};

export const addDealToColumn = (
  board: CrmBoardRecord,
  deal: CrmDealEntity
): CrmBoardRecord => {
  if (deal.id == null || deal.stageId == null) return board;
  const column = board[deal.stageId];
  if (!column || column.dealIds.includes(deal.id)) return board;
  return {
    ...board,
    [deal.stageId]: {
      ...column,
      dealIds: [...column.dealIds, deal.id],
      totalCount: column.totalCount + 1
    }
  };
};

export const removeDealFromBoard = (
  board: CrmBoardRecord,
  dealId: number
): CrmBoardRecord => {
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

  return changed ? nextBoard : board;
};

type BoardStore = {
  deals: CrmDealRecord;
  board: CrmBoardRecord;
  dealIds: number[];
};

export const ingestCreatedDeal = (
  current: BoardStore,
  deal: CrmDealEntity
): BoardStore => {
  const deals = mergeDeals(current.deals, [deal]);
  if (deal.id == null) {
    return { deals, board: current.board, dealIds: current.dealIds };
  }
  return {
    deals,
    board: addDealToColumn(current.board, deal),
    dealIds: appendId(current.dealIds, deal.id)
  };
};

export const ingestEditedDeal = (
  current: { deals: CrmDealRecord; board: CrmBoardRecord },
  deal: CrmDealEntity
): { deals: CrmDealRecord; board: CrmBoardRecord } => {
  const deals = mergeDeals(current.deals, [deal]);
  if (deal.id == null) return { deals, board: current.board };

  const currentColumnStage = findStageIdByDealId(current.board, deal.id);
  if (
    deal.stageId != null &&
    currentColumnStage != null &&
    currentColumnStage !== deal.stageId
  ) {
    const targetColumn = current.board[deal.stageId];
    return moveDealBetweenColumns(
      { board: current.board, deals },
      {
        dealId: deal.id,
        fromStageId: currentColumnStage,
        toStageId: deal.stageId,
        insertIndex: targetColumn ? targetColumn.dealIds.length : 0
      }
    );
  }

  return { deals, board: current.board };
};

export const removeDeal = (current: BoardStore, id: number): BoardStore => ({
  deals: removeDealFromRecord(current.deals, id),
  board: removeDealFromBoard(current.board, id),
  dealIds: removeDealId(current.dealIds, id)
});

export interface ResolvedBoardCard {
  deal: CrmDealEntity | undefined;
  owner: CrmOwnerEntity | undefined;
  contact: CrmContactEntity | undefined;
  company: CrmCompanyEntity | undefined;
}

export const resolveColumnDeals = (
  column: CrmBoardColumn | undefined,
  deals: CrmDealRecord
): CrmDealEntity[] =>
  (column?.dealIds ?? [])
    .map((id) => deals[id])
    .filter((deal): deal is CrmDealEntity => Boolean(deal));

export const resolveBoardCard = (
  deal: CrmDealEntity | undefined,
  owners: CrmOwnerRecord,
  contacts: CrmContactRecord,
  companies: CrmCompanyRecord
): ResolvedBoardCard => ({
  deal,
  owner: deal?.ownerId != null ? owners[deal.ownerId] : undefined,
  contact: deal?.contactId != null ? contacts[deal.contactId] : undefined,
  company: deal?.companyId != null ? companies[deal.companyId] : undefined
});

export interface CrmBoardNeighbours {
  previousDealId: number | null;
  nextDealId: number | null;
}

export interface CrmBoardReorderResult extends CrmBoardNeighbours {
  orderedDealIds: number[];
}

export const computeReorderWithinStage = (
  dealIds: number[],
  activeDealId: number,
  overDealId: number
): CrmBoardReorderResult | null => {
  const activeIndex = dealIds.indexOf(activeDealId);
  const overIndex = dealIds.indexOf(overDealId);
  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return null;
  }

  const orderedDealIds = arrayMove(dealIds, activeIndex, overIndex);
  return {
    orderedDealIds,
    previousDealId: overIndex > 0 ? orderedDealIds[overIndex - 1] : null,
    nextDealId:
      overIndex < orderedDealIds.length - 1
        ? orderedDealIds[overIndex + 1]
        : null
  };
};

export const computeInsertIndex = (
  targetDealIds: number[],
  overDealId: number,
  activeCenterY: number | null,
  overCenterY: number | null
): number => {
  const overIndex = targetDealIds.indexOf(overDealId);
  if (overIndex === -1) return targetDealIds.length;
  if (activeCenterY !== null && overCenterY !== null) {
    return activeCenterY < overCenterY ? overIndex : overIndex + 1;
  }
  return overIndex;
};

export const resolveInsertIndex = (
  isOverStageContainer: boolean,
  targetDealIds: number[],
  overDealId: number,
  activeRect: ClientRect | null,
  overRect: ClientRect | null
): number => {
  if (isOverStageContainer) return targetDealIds.length;

  const activeCenterY = activeRect
    ? activeRect.top + activeRect.height / 2
    : null;
  const overCenterY = overRect ? overRect.top + overRect.height / 2 : null;

  return computeInsertIndex(
    targetDealIds,
    overDealId,
    activeCenterY,
    overCenterY
  );
};

export const computeMoveNeighbors = (
  targetDealIds: number[],
  insertIndex: number
): CrmBoardNeighbours => {
  if (targetDealIds.length === 0 || insertIndex === 0) {
    return { previousDealId: null, nextDealId: targetDealIds[0] ?? null };
  }
  if (insertIndex >= targetDealIds.length) {
    return { previousDealId: targetDealIds.at(-1) ?? null, nextDealId: null };
  }
  return {
    previousDealId: targetDealIds[insertIndex - 1],
    nextDealId: targetDealIds[insertIndex]
  };
};
