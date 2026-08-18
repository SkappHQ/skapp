import { useCrmStoreV2 } from "../store/store";
import { CrmDealEntity } from "../types/CrmCommonTypes";
import {
  addDealToColumn,
  findStageIdByDealId,
  moveDealBetweenColumns,
  removeDealFromBoard
} from "./boardUtil";
import {
  appendListDealId,
  removeDealFromRecord,
  removeListDealId,
  upsertDeals
} from "./dealUtil";

// Cross-cutting deal write orchestration (create / edit / delete) that keeps the
// shared `deals` record, the list ordering, and the board columns consistent in
// one place. Composes the list helpers (dealUtil) and the board helpers
// (boardUtil); nothing imports this module, so there is no import cycle.

// A newly created deal: upsert it, add it to its stage column (if that column is
// loaded), and append it to the list ordering.
export const ingestCreatedDeal = (deal: CrmDealEntity): void => {
  if (deal.id == null) return;
  // addDealToColumn upserts the deal and adds it to the board column when the
  // stage is loaded; if the board isn't active it still upserts.
  addDealToColumn(deal);
  appendListDealId(deal.id);
};

// An edited deal (scalar response): merge it, and if its stage changed, move its
// board card from the column that currently holds it to the new stage column.
export const ingestEditedDeal = (deal: CrmDealEntity): void => {
  if (deal.id == null) {
    upsertDeals([deal]);
    return;
  }

  const currentColumnStage = findStageIdByDealId(
    useCrmStoreV2.getState().board,
    deal.id
  );

  upsertDeals([deal]);

  if (
    deal.stageId != null &&
    currentColumnStage != null &&
    currentColumnStage !== deal.stageId
  ) {
    const targetColumn = useCrmStoreV2.getState().board[deal.stageId];
    moveDealBetweenColumns({
      dealId: deal.id,
      fromStageId: currentColumnStage,
      toStageId: deal.stageId,
      insertIndex: targetColumn ? targetColumn.dealIds.length : 0
    });
  }
};

// A deleted deal: drop it from the board column, the list ordering, and the
// shared record.
export const removeDeal = (id: number): void => {
  removeDealFromBoard(id);
  removeListDealId(id);
  removeDealFromRecord(id);
};
