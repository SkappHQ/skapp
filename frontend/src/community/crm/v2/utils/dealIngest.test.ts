import { CrmPriorityEnum } from "../enums/common";
import { useCrmStoreV2 } from "../store/store";
import { CrmDealEntity } from "../types/CrmCommonTypes";
import { CrmBoardDealResponse, CrmDealsByStagesResponse } from "../types/CrmTypes";
import { ingestBoardStageDeals } from "./boardUtil";
import { ingestCreatedDeal, ingestEditedDeal, removeDeal } from "./dealIngest";

const STAGE_A = 1;
const STAGE_B = 2;

const boardDeal = (id: number): CrmBoardDealResponse => ({
  id,
  name: `Deal ${id}`,
  amount: "100",
  ownerId: 10,
  companyId: 20,
  contactId: 30,
  priority: CrmPriorityEnum.MEDIUM,
  taskCount: 0
});

const group = (
  stageId: number,
  deals: CrmBoardDealResponse[]
): CrmDealsByStagesResponse => ({
  stageId,
  deals,
  totalCount: deals.length,
  currentPage: 0,
  totalPages: 1,
  pageSize: 20,
  hasNextPage: false
});

const deal = (overrides: Partial<CrmDealEntity>): CrmDealEntity => ({
  id: 100,
  name: "New Deal",
  priority: CrmPriorityEnum.HIGH,
  stageId: STAGE_A,
  ownerId: 10,
  companyId: 20,
  contactId: 30,
  ...overrides
});

const resetStore = (): void => {
  useCrmStoreV2.setState({
    deals: {},
    board: {},
    dealIds: [],
    stageIds: []
  });
};

describe("deal create/edit/delete orchestration", () => {
  beforeEach(resetStore);

  it("ingestCreatedDeal adds the deal to its column and the list order", () => {
    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1)]), group(STAGE_B, [])]);
    useCrmStoreV2.getState().setDealIds([1]);

    ingestCreatedDeal(deal({ id: 100, stageId: STAGE_A }));

    const { board, deals, dealIds } = useCrmStoreV2.getState();
    expect(board[STAGE_A].dealIds).toEqual([1, 100]);
    expect(board[STAGE_A].totalCount).toBe(2);
    expect(dealIds).toEqual([1, 100]);
    expect(deals[100].name).toBe("New Deal");
  });

  it("ingestEditedDeal moves the board card when the stage changes", () => {
    ingestBoardStageDeals([
      group(STAGE_A, [boardDeal(1), boardDeal(2)]),
      group(STAGE_B, [boardDeal(3)])
    ]);

    ingestEditedDeal(deal({ id: 1, stageId: STAGE_B, name: "Edited" }));

    const { board, deals } = useCrmStoreV2.getState();
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(board[STAGE_B].dealIds).toEqual([3, 1]);
    expect(deals[1].stageId).toBe(STAGE_B);
    expect(deals[1].name).toBe("Edited");
  });

  it("ingestEditedDeal keeps the card in place when the stage is unchanged", () => {
    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1), boardDeal(2)])]);

    ingestEditedDeal(deal({ id: 1, stageId: STAGE_A, amount: "999" }));

    const { board, deals } = useCrmStoreV2.getState();
    expect(board[STAGE_A].dealIds).toEqual([1, 2]);
    expect(deals[1].amount).toBe("999");
  });

  it("removeDeal drops the deal from board, list and record", () => {
    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1), boardDeal(2)])]);
    useCrmStoreV2.getState().setDealIds([1, 2]);

    removeDeal(1);

    const { board, deals, dealIds } = useCrmStoreV2.getState();
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(dealIds).toEqual([2]);
    expect(deals[1]).toBeUndefined();
  });
});
