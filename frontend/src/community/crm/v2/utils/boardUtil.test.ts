import { CrmPriorityEnum } from "../enums/common";
import { useCrmStoreV2 } from "../store/store";
import {
  CrmContactEntity,
  CrmDealEntity,
  CrmOwnerEntity
} from "../types/CrmCommonTypes";
import { CrmBoardDealResponse, CrmDealsByStagesResponse } from "../types/CrmTypes";
import {
  findStageIdByDealId,
  ingestBoardStageDeals,
  moveDealBetweenColumns,
  removeDealFromBoard,
  reorderDealInColumn
} from "./boardUtil";
import { toContactsRecord, toOwnersRecord } from "./crmEntityUtils";
import { upsertDeals } from "./dealUtil";

const STAGE_A = 1;
const STAGE_B = 2;

const owner = (employeeId: number): CrmOwnerEntity => ({
  employeeId,
  firstName: `Owner${employeeId}`
});

const contact = (id: number): CrmContactEntity => ({ id, name: `Contact ${id}` });

const boardDeal = (
  id: number,
  overrides: Partial<CrmBoardDealResponse> = {}
): CrmBoardDealResponse => ({
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
  deals: CrmBoardDealResponse[],
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

const resetStore = (): void => {
  useCrmStoreV2.setState({
    deals: {},
    board: {},
    owners: {},
    contacts: {},
    companies: {},
    stages: {},
    dealIds: [],
    stageIds: []
  });
};

describe("board ingestion + mutation on the normalized store", () => {
  beforeEach(resetStore);

  it("ingests stage groups into scalar deals + ordered board columns", () => {
    // reference data as the provider would have loaded it
    useCrmStoreV2.getState().setOwners(toOwnersRecord([owner(10)]));
    useCrmStoreV2.getState().setContacts(toContactsRecord([contact(30)]));

    ingestBoardStageDeals([
      group(STAGE_A, [boardDeal(1), boardDeal(2)]),
      group(STAGE_B, [boardDeal(3)])
    ]);

    const { board, deals } = useCrmStoreV2.getState();

    expect(board[STAGE_A].dealIds).toEqual([1, 2]);
    expect(board[STAGE_B].dealIds).toEqual([3]);
    expect(board[STAGE_A].totalCount).toBe(2);

    // a full board load also fills the flat list ordering (what the table view
    // reads), flattened in stage order
    expect(useCrmStoreV2.getState().dealIds).toEqual([1, 2, 3]);

    // slim board card -> scalar entity: stageId stamped, taskCount -> openTasksCount
    expect(deals[1]).toMatchObject<CrmDealEntity>({
      id: 1,
      name: "Deal 1",
      stageId: STAGE_A,
      ownerId: 10,
      companyId: 20,
      contactId: 30,
      openTasksCount: 1,
      priority: CrmPriorityEnum.MEDIUM
    });

    // the card's related entities resolve from the shared records (selector logic)
    expect(deals[1].ownerId != null && useCrmStoreV2.getState().owners[deals[1].ownerId!]).toBeTruthy();
    expect(deals[1].contactId != null && useCrmStoreV2.getState().contacts[deals[1].contactId!]).toBeTruthy();
  });

  it("merges a slim board card onto an existing full deal without clobbering", () => {
    // a full deal already in the store (e.g. from the list/detail read)
    upsertDeals([
      {
        id: 1,
        name: "Deal 1",
        description: "long description",
        orderIndex: "aaa",
        closingAt: "2026-01-01",
        stageId: STAGE_A
      }
    ]);

    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1)])]);

    const deal = useCrmStoreV2.getState().deals[1];
    // board-only fields applied...
    expect(deal.openTasksCount).toBe(1);
    expect(deal.ownerId).toBe(10);
    // ...and list-only fields preserved
    expect(deal.description).toBe("long description");
    expect(deal.orderIndex).toBe("aaa");
    expect(deal.closingAt).toBe("2026-01-01");
  });

  it("appends a next page into the column, de-duping overlap", () => {
    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1), boardDeal(2)])]);
    ingestBoardStageDeals(
      [
        group(STAGE_A, [boardDeal(2), boardDeal(3)], {
          currentPage: 1,
          hasNextPage: false
        })
      ],
      { append: true }
    );

    expect(useCrmStoreV2.getState().board[STAGE_A].dealIds).toEqual([1, 2, 3]);
    expect(useCrmStoreV2.getState().board[STAGE_A].currentPage).toBe(1);

    // load-more appends the new ids to the flat list ordering too, de-duped
    expect(useCrmStoreV2.getState().dealIds).toEqual([1, 2, 3]);
  });

  it("reorders ids within a column", () => {
    ingestBoardStageDeals([
      group(STAGE_A, [boardDeal(1), boardDeal(2), boardDeal(3)])
    ]);

    reorderDealInColumn(STAGE_A, [3, 1, 2]);

    expect(useCrmStoreV2.getState().board[STAGE_A].dealIds).toEqual([3, 1, 2]);
  });

  it("moves a deal across columns, adjusting totals and restamping stageId", () => {
    ingestBoardStageDeals([
      group(STAGE_A, [boardDeal(1), boardDeal(2)]),
      group(STAGE_B, [boardDeal(3)])
    ]);

    moveDealBetweenColumns({
      dealId: 1,
      fromStageId: STAGE_A,
      toStageId: STAGE_B,
      insertIndex: 1
    });

    const { board, deals } = useCrmStoreV2.getState();
    expect(board[STAGE_A].dealIds).toEqual([2]);
    expect(board[STAGE_B].dealIds).toEqual([3, 1]);
    expect(board[STAGE_A].totalCount).toBe(1);
    expect(board[STAGE_B].totalCount).toBe(2);
    expect(deals[1].stageId).toBe(STAGE_B);
    expect(findStageIdByDealId(board, 1)).toBe(STAGE_B);
  });

  it("removes a deal id from whichever column holds it", () => {
    ingestBoardStageDeals([group(STAGE_A, [boardDeal(1), boardDeal(2)])]);

    removeDealFromBoard(1);

    expect(useCrmStoreV2.getState().board[STAGE_A].dealIds).toEqual([2]);
    expect(useCrmStoreV2.getState().board[STAGE_A].totalCount).toBe(1);
  });
});
