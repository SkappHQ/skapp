import { CrmPriorityEnum } from "../enums/common";
import { CrmDealEntity } from "../types/CrmCommonTypes";
import { CrmDealsByStagesResponse } from "../types/CrmTypes";
import {
  ingestBoardStageDeals,
  ingestCreatedDeal,
  ingestEditedDeal,
  removeDeal
} from "./boardUtil";
import { reorderDealIds } from "./dealUtil";

const STAGE_A = 1;
const STAGE_B = 2;

const boardDeal = (id: number): CrmDealEntity => ({
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
  deals: CrmDealEntity[]
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

describe("deal create/edit/delete orchestration as pure record transforms", () => {
  it("ingestCreatedDeal adds the deal to its column and the list order", () => {
    const ingested = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1)]), group(STAGE_B, [])]
    );
    const current = { ...ingested, dealIds: [1] };

    const result = ingestCreatedDeal(current, deal({ id: 100, stageId: STAGE_A }));

    const { board, deals, dealIds } = result;
    expect(board[STAGE_A].dealIds).toEqual([1, 100]);
    expect(board[STAGE_A].totalCount).toBe(2);
    expect(dealIds).toEqual([1, 100]);
    expect(deals[100].name).toBe("New Deal");
  });

  it("ingestEditedDeal moves the board card when the stage changes", () => {
    const current = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [
        group(STAGE_A, [boardDeal(1), boardDeal(2)]),
        group(STAGE_B, [boardDeal(3)])
      ]
    );

    const result = ingestEditedDeal(current, deal({ id: 1, stageId: STAGE_B, name: "Edited" }));

    const { board, deals } = result;
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(board[STAGE_B].dealIds).toEqual([3, 1]);
    expect(deals[1].stageId).toBe(STAGE_B);
    expect(deals[1].name).toBe("Edited");
  });

  it("ingestEditedDeal keeps the card in place when the stage is unchanged", () => {
    const current = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1), boardDeal(2)])]
    );

    const result = ingestEditedDeal(current, deal({ id: 1, stageId: STAGE_A, amount: "999" }));

    const { board, deals } = result;
    expect(board[STAGE_A].dealIds).toEqual([1, 2]);
    expect(deals[1].amount).toBe("999");
  });

  it("removeDeal drops the deal from board, list and record", () => {
    const ingested = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1), boardDeal(2)])]
    );
    const current = { ...ingested, dealIds: [1, 2] };

    const result = removeDeal(current, 1);

    const { board, deals, dealIds } = result;
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(dealIds).toEqual([2]);
    expect(deals[1]).toBeUndefined();
  });
});

describe("reorderDealIds", () => {
  const ids = [1, 2, 3, 4];

  it("inserts after the previous neighbour", () => {
    expect(reorderDealIds(ids, 4, 1, 2)).toEqual([1, 4, 2, 3]);
  });

  it("inserts before the next neighbour when there is no previous one", () => {
    expect(reorderDealIds(ids, 3, null, 1)).toEqual([3, 1, 2, 4]);
  });

  it("moves to the top when neither neighbour is known", () => {
    expect(reorderDealIds(ids, 3, null, null)).toEqual([3, 1, 2, 4]);
  });

  it("falls back to the next neighbour when the previous one is missing", () => {
    expect(reorderDealIds(ids, 4, 99, 2)).toEqual([1, 4, 2, 3]);
  });

  it("appends when neither neighbour is present in the list", () => {
    expect(reorderDealIds(ids, 2, 99, 98)).toEqual([1, 3, 4, 2]);
  });

  it("leaves the order unchanged when the deal is already in place", () => {
    expect(reorderDealIds(ids, 2, 1, 3)).toEqual([1, 2, 3, 4]);
  });
});
