import type { ClientRect } from "@dnd-kit/core";

import { CrmPriorityEnum } from "../enums/common";
import { CrmDealEntity, CrmDealRecord } from "../types/CrmCommonTypes";
import { CrmDealsByStagesResponse } from "../types/CrmTypes";
import {
  computeInsertIndex,
  computeMoveNeighbors,
  computeReorderWithinStage,
  findStageIdByDealId,
  ingestBoardStageDeals,
  moveDealBetweenColumns,
  removeDealFromBoard,
  reorderDealInColumn,
  resolveInsertIndex
} from "./boardUtil";

const STAGE_A = 1;
const STAGE_B = 2;

const boardDeal = (
  id: number,
  overrides: Partial<CrmDealEntity> = {}
): CrmDealEntity => ({
  id,
  name: `Deal ${id}`,
  amount: "100",
  ownerId: 10,
  companyId: 20,
  contactId: 30,
  priority: CrmPriorityEnum.MEDIUM,
  taskCount: id,
  ...overrides
});

const group = (
  stageId: number,
  deals: CrmDealEntity[],
  overrides: Partial<CrmDealsByStagesResponse> = {}
): CrmDealsByStagesResponse => ({
  stageId,
  deals,
  totalCount: deals.length,
  currentPage: 0,
  totalPages: 1,
  pageSize: 20,
  hasNextPage: false,
  ...overrides
});

describe("board ingestion + mutation as pure record transforms", () => {
  it("ingests stage groups into scalar deals + ordered board columns", () => {
    const result = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [
        group(STAGE_A, [boardDeal(1), boardDeal(2)]),
        group(STAGE_B, [boardDeal(3)])
      ]
    );

    expect(result.board[STAGE_A].dealIds).toEqual([1, 2]);
    expect(result.board[STAGE_B].dealIds).toEqual([3]);
    expect(result.board[STAGE_A].totalCount).toBe(2);

    // a full board load also fills the flat list ordering (what the table view
    // reads), flattened in stage order
    expect(result.dealIds).toEqual([1, 2, 3]);

    // slim board card -> scalar entity: stageId stamped from the group, scalar
    // related-entity keys preserved
    expect(result.deals[1]).toMatchObject<CrmDealEntity>({
      id: 1,
      name: "Deal 1",
      stageId: STAGE_A,
      ownerId: 10,
      companyId: 20,
      contactId: 30,
      taskCount: 1,
      priority: CrmPriorityEnum.MEDIUM
    });
  });

  it("merges a slim board card onto an existing full deal without clobbering", () => {
    // a full deal already in the record (e.g. from the list/detail read)
    const existing: CrmDealRecord = {
      1: {
        id: 1,
        name: "Deal 1",
        description: "long description",
        orderIndex: "aaa",
        closingAt: "2026-01-01",
        stageId: STAGE_A
      }
    };

    const result = ingestBoardStageDeals(
      { deals: existing, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1)])]
    );

    const deal = result.deals[1];
    // board-only fields applied...
    expect(deal.taskCount).toBe(1);
    expect(deal.ownerId).toBe(10);
    // ...and list-only fields preserved
    expect(deal.description).toBe("long description");
    expect(deal.orderIndex).toBe("aaa");
    expect(deal.closingAt).toBe("2026-01-01");
  });

  it("appends a next page into the column, de-duping overlap", () => {
    const first = ingestBoardStageDeals({ deals: {}, board: {}, dealIds: [] }, [
      group(STAGE_A, [boardDeal(1), boardDeal(2)])
    ]);

    const result = ingestBoardStageDeals(
      first,
      [
        group(STAGE_A, [boardDeal(2), boardDeal(3)], {
          currentPage: 1,
          hasNextPage: false
        })
      ],
      { append: true }
    );

    expect(result.board[STAGE_A].dealIds).toEqual([1, 2, 3]);
    expect(result.board[STAGE_A].currentPage).toBe(1);

    // load-more appends the new ids to the flat list ordering too, de-duped
    expect(result.dealIds).toEqual([1, 2, 3]);
  });

  it("reorders ids within a column", () => {
    const { board } = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1), boardDeal(2), boardDeal(3)])]
    );

    const result = reorderDealInColumn(board, STAGE_A, [3, 1, 2]);

    expect(result[STAGE_A].dealIds).toEqual([3, 1, 2]);
  });

  it("moves a deal across columns, adjusting totals and restamping stageId", () => {
    const ingested = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [
        group(STAGE_A, [boardDeal(1), boardDeal(2)]),
        group(STAGE_B, [boardDeal(3)])
      ]
    );

    const result = moveDealBetweenColumns(
      { board: ingested.board, deals: ingested.deals },
      {
        dealId: 1,
        fromStageId: STAGE_A,
        toStageId: STAGE_B,
        insertIndex: 1
      }
    );

    const { board, deals } = result;
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(board[STAGE_B].dealIds).toEqual([3, 1]);
    expect(board[STAGE_A].totalCount).toBe(1);
    expect(board[STAGE_B].totalCount).toBe(2);
    expect(deals[1].stageId).toBe(STAGE_B);
    expect(findStageIdByDealId(board, 1)).toBe(STAGE_B);
  });

  it("removes a deal id from whichever column holds it", () => {
    const { board } = ingestBoardStageDeals(
      { deals: {}, board: {}, dealIds: [] },
      [group(STAGE_A, [boardDeal(1), boardDeal(2)])]
    );

    const result = removeDealFromBoard(board, 1);

    expect(result[STAGE_A].dealIds).toEqual([2]);
    expect(result[STAGE_A].totalCount).toBe(1);
  });
});

const rect = (top: number, height = 100): ClientRect => ({
  top,
  height,
  bottom: top + height,
  left: 0,
  right: 0,
  width: 0
});

describe("computeReorderWithinStage", () => {
  const dealIds = [1, 2, 3];

  it("reorders and returns neighbours when moving to the last position", () => {
    // arrayMove([1,2,3], 0, 2) → [2, 3, 1]
    const result = computeReorderWithinStage(dealIds, 1, 3);

    expect(result).not.toBeNull();
    expect(result!.orderedDealIds).toEqual([2, 3, 1]);
    expect(result!.previousDealId).toBe(3);
    expect(result!.nextDealId).toBeNull();
  });

  it("reorders and returns neighbours when moving to the first position", () => {
    // arrayMove([1,2,3], 2, 0) → [3, 1, 2]
    const result = computeReorderWithinStage(dealIds, 3, 1);

    expect(result).not.toBeNull();
    expect(result!.orderedDealIds).toEqual([3, 1, 2]);
    expect(result!.previousDealId).toBeNull();
    expect(result!.nextDealId).toBe(1);
  });

  it("returns null when activeDealId is not found", () => {
    expect(computeReorderWithinStage(dealIds, 999, 1)).toBeNull();
  });

  it("returns null when overDealId is not found", () => {
    expect(computeReorderWithinStage(dealIds, 1, 999)).toBeNull();
  });

  it("returns null when active and over are the same deal", () => {
    expect(computeReorderWithinStage(dealIds, 1, 1)).toBeNull();
  });
});

describe("computeInsertIndex", () => {
  const targetDealIds = [10, 20, 30];

  it("appends when the over deal is not in the column", () => {
    expect(computeInsertIndex(targetDealIds, 999, null, null)).toBe(3);
  });

  it("inserts before the hovered card when dragged centre is above it", () => {
    expect(computeInsertIndex(targetDealIds, 20, 40, 150)).toBe(1);
  });

  it("inserts after the hovered card when dragged centre is below it", () => {
    expect(computeInsertIndex(targetDealIds, 20, 260, 150)).toBe(2);
  });

  it("falls back to the over index when centres are unknown", () => {
    expect(computeInsertIndex(targetDealIds, 30, null, null)).toBe(2);
  });
});

describe("resolveInsertIndex", () => {
  const targetDealIds = [10, 20, 30];

  it("appends to the end when dropping on the column container", () => {
    expect(resolveInsertIndex(true, targetDealIds, 20, rect(0), rect(0))).toBe(
      3
    );
  });

  it("uses the centre comparison when dropping over a card", () => {
    // active centre (50+50=100) above over centre (200+50=250) → over index
    expect(
      resolveInsertIndex(false, targetDealIds, 20, rect(50), rect(200))
    ).toBe(1);
    // active centre below over centre → over index + 1
    expect(
      resolveInsertIndex(false, targetDealIds, 20, rect(300), rect(200))
    ).toBe(2);
  });
});

describe("computeMoveNeighbors", () => {
  const targetDealIds = [10, 20, 30];

  it("returns nulls-around-first for an empty column", () => {
    expect(computeMoveNeighbors([], 0)).toEqual({
      previousDealId: null,
      nextDealId: null
    });
  });

  it("inserting at the head has no previous and the old head as next", () => {
    expect(computeMoveNeighbors(targetDealIds, 0)).toEqual({
      previousDealId: null,
      nextDealId: 10
    });
  });

  it("inserting at the tail has the old tail as previous and no next", () => {
    expect(computeMoveNeighbors(targetDealIds, 3)).toEqual({
      previousDealId: 30,
      nextDealId: null
    });
  });

  it("inserting in the middle straddles the two neighbours", () => {
    expect(computeMoveNeighbors(targetDealIds, 1)).toEqual({
      previousDealId: 10,
      nextDealId: 20
    });
  });
});
