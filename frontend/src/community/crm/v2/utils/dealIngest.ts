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

export const ingestCreatedDeal = (deal: CrmDealEntity): void => {
  if (deal.id == null) return;
  addDealToColumn(deal);
  appendListDealId(deal.id);
};

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

export const removeDeal = (id: number): void => {
  removeDealFromBoard(id);
  removeListDealId(id);
  removeDealFromRecord(id);
};
