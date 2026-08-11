import {
  CrmBoardColumn,
  CrmDealEntity,
  CrmTaskEntity
} from "~community/crm/types/CrmTypes";

export interface CrmDealsSlice {
  deals: Record<number, CrmDealEntity>;
  dealIds: number[];
  board: Record<number, CrmBoardColumn>;

  setDeals: (deals: CrmDealEntity[], currentPage?: number) => void;
  upsertDeals: (deals: CrmDealEntity[]) => void;
  upsertDeal: (deal: CrmDealEntity) => void;
  removeDeal: (dealId: number) => void;

  setBoardColumn: (
    stageId: number,
    deals: CrmDealEntity[],
    totalCount: number,
    currentPage: number,
    hasNextPage: boolean
  ) => void;
  moveDeal: (dealId: number, toStageId: number, toIndex: number) => void;

  setDealTasks: (dealId: number, tasks: CrmTaskEntity[]) => void;
}
