import {
  CrmBoardColumn,
  CrmDealEntity
} from "~community/crm/v2/types/CrmTypes";

export interface CrmDealsSlice {
  deals: Record<number, CrmDealEntity>;
  dealIds: number[];
  board: Record<number, CrmBoardColumn>;

  upsertDeals: (deals: CrmDealEntity[]) => void;
  upsertDeal: (deal: CrmDealEntity) => void;
  removeDeal: (dealId: number) => void;

  setDealIds: (dealIds: number[]) => void;
  appendDealIds: (dealIds: number[]) => void;

  setBoard: (board: Record<number, CrmBoardColumn>) => void;
  setBoardColumn: (stageId: number, column: CrmBoardColumn) => void;
  appendBoardColumnDealIds: (
    stageId: number,
    dealIds: number[],
    currentPage: number,
    hasNextPage: boolean
  ) => void;
  moveDeal: (dealId: number, toStageId: number, toIndex: number) => void;

  setDealTaskIds: (dealId: number, taskIds: number[]) => void;
  appendDealTaskIds: (dealId: number, taskIds: number[]) => void;
}
