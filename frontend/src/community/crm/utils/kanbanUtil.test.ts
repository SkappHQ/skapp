import {
  CrmDealStageColorsEnum,
  CrmDealStageEnum,
  CrmPriorityEnum
} from "~community/crm/enums/common";
import type {
  CrmBoardDealResponseType,
  CrmBoardDealSliceType,
  CrmBoardStageDealsResponseType,
  CrmBoardStageDealsType
} from "~community/crm/types/BoardTypes";
import type {
  CrmContactLookup,
  CrmDealResponseType,
  CrmDealStageType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

import {
  applyMoveToStageMap,
  computeReorderWithinStage,
  getNeighbourDealIds,
  mapCreatedDealToSlice,
  normalizeStageDeals,
  replaceStagesInStageMap,
  resolveBoardDeal,
  updateDealInStageMap
} from "./kanbanUtil";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const OWNER: CrmOwner = {
  employeeId: 1,
  firstName: "Alice",
  lastName: "Smith",
  authPic: null
};

const CONTACT_WITH_COMPANY: CrmContactLookup = {
  id: 10,
  name: "Acme Lead",
  company: { id: 5, name: "Acme Corp" }
};

const CONTACT_NO_COMPANY: CrmContactLookup = {
  id: 20,
  name: "Solo Lead",
  company: null
};

const mkRawDeal = (
  id: number,
  ownerId = 1,
  contactId = 10
): CrmBoardDealResponseType => ({
  id,
  name: `Deal ${id}`,
  amount: "500",
  ownerId,
  companyId: null,
  contactId,
  priority: CrmPriorityEnum.LOW,
  taskCount: 0
});

const mkSliceDeal = (id: number, stageId = 10): CrmBoardDealSliceType => ({
  id,
  name: `Deal ${id}`,
  contactName: "Acme Lead",
  companyName: "Acme Corp",
  owner: OWNER,
  amount: "500",
  priority: CrmPriorityEnum.LOW,
  taskCount: 0,
  stageId
});

const mkRawStageEntry = (
  stageId: number,
  deals: CrmBoardDealResponseType[],
  totalCount = deals.length
): CrmBoardStageDealsResponseType => ({
  stageId,
  deals,
  totalCount,
  currentPage: 0,
  totalPages: 1,
  pageSize: 20,
  hasNextPage: false
});

const mkStageEntry = (
  stageId: number,
  deals: CrmBoardDealSliceType[],
  totalCount = deals.length
): CrmBoardStageDealsType => ({
  stageId,
  deals,
  totalCount,
  currentPage: 0,
  totalPages: 1,
  pageSize: 20,
  hasNextPage: false
});

const mkStageType = (id: number): CrmDealStageType => ({
  id,
  name: `Stage ${id}`,
  color: CrmDealStageColorsEnum.SKY,
  orderIndex: id,
  stageType: CrmDealStageEnum.OPEN
});

// ─── resolveBoardDeal ─────────────────────────────────────────────────────────

describe("resolveBoardDeal", () => {
  it("should resolve deal with matching owner and contact with company", () => {
    const raw = mkRawDeal(1, 1, 10);
    const result = resolveBoardDeal(raw, 7, OWNER, CONTACT_WITH_COMPANY);

    expect(result).toEqual({
      id: 1,
      name: "Deal 1",
      contactName: "Acme Lead",
      companyName: "Acme Corp",
      owner: OWNER,
      amount: "500",
      priority: CrmPriorityEnum.LOW,
      taskCount: 0,
      stageId: 7
    });
  });

  it("should set companyName to null when contact has no company", () => {
    const raw = mkRawDeal(2, 1, 20);
    const result = resolveBoardDeal(raw, 7, OWNER, CONTACT_NO_COMPANY);

    expect(result.companyName).toBeNull();
    expect(result.contactName).toBe("Solo Lead");
  });

  it("should set contactName to empty string and companyName to null when contact is not found", () => {
    const raw = mkRawDeal(3, 1, 999);
    const result = resolveBoardDeal(raw, 7, OWNER, undefined);

    expect(result.contactName).toBe("");
    expect(result.companyName).toBeNull();
  });

  it("should set owner to undefined when ownerId has no match", () => {
    const raw = mkRawDeal(4, 999, 10);
    const result = resolveBoardDeal(
      raw,
      7,
      undefined as unknown as CrmOwner,
      CONTACT_WITH_COMPANY
    );

    expect(result.owner).toBeUndefined();
  });
});

// ─── getNeighbourDealIds ──────────────────────────────────────────────────────

describe("getNeighbourDealIds", () => {
  const d1 = mkSliceDeal(1);
  const d2 = mkSliceDeal(2);
  const d3 = mkSliceDeal(3);
  const stageMap = [mkStageEntry(10, [d1, d2, d3])];

  it("should return null previousDealId for the first deal", () => {
    expect(getNeighbourDealIds(stageMap, 10, 1)).toEqual({
      previousDealId: null,
      nextDealId: 2
    });
  });

  it("should return null nextDealId for the last deal", () => {
    expect(getNeighbourDealIds(stageMap, 10, 3)).toEqual({
      previousDealId: 2,
      nextDealId: null
    });
  });

  it("should return both neighbours for a middle deal", () => {
    expect(getNeighbourDealIds(stageMap, 10, 2)).toEqual({
      previousDealId: 1,
      nextDealId: 3
    });
  });

  it("should return both null when dealId is not in the stage", () => {
    expect(getNeighbourDealIds(stageMap, 10, 999)).toEqual({
      previousDealId: null,
      nextDealId: null
    });
  });

  it("should return both null when stageId is not found", () => {
    expect(getNeighbourDealIds(stageMap, 999, 1)).toEqual({
      previousDealId: null,
      nextDealId: null
    });
  });
});

// ─── normalizeStageDeals ──────────────────────────────────────────────────────

describe("normalizeStageDeals", () => {
  const owners = [OWNER];
  const contacts = [CONTACT_WITH_COMPANY];

  it("should map each stage entry's deals to slice deals", () => {
    const entry = mkRawStageEntry(1, [mkRawDeal(1)], 5);
    const result = normalizeStageDeals([entry], owners, contacts);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...entry,
      deals: [mkSliceDeal(1, 1)]
    });
  });

  it("should preserve pagination fields and entry order, including empty stages", () => {
    const first = mkRawStageEntry(1, [mkRawDeal(1)], 5);
    const second = mkRawStageEntry(2, [], 0);
    const result = normalizeStageDeals([first, second], owners, contacts);

    expect(result).toHaveLength(2);
    expect(result[0].stageId).toBe(1);
    expect(result[0].totalCount).toBe(5);
    expect(result[0].deals).toEqual([mkSliceDeal(1, 1)]);
    expect(result[1].stageId).toBe(2);
    expect(result[1].deals).toEqual([]);
  });

  it("should return an empty array when there are no stage entries", () => {
    expect(normalizeStageDeals([], owners, contacts)).toEqual([]);
  });
});

// ─── applyMoveToStageMap (cross-stage move) ───────────────────────────────────

describe("applyMoveToStageMap", () => {
  const d1 = mkSliceDeal(1, 1);
  const d2 = mkSliceDeal(2, 1);
  const d3 = mkSliceDeal(3, 2);
  const d4 = mkSliceDeal(4, 2);
  const d5 = mkSliceDeal(5, 3);

  const sourceStage = mkStageEntry(1, [d1, d2], 2);
  const targetStage = mkStageEntry(2, [d3, d4], 2);
  const otherStage = mkStageEntry(3, [d5], 1);
  const stageMap = [sourceStage, targetStage, otherStage];

  it("should remove the moved deal from the source stage and decrement its totalCount", () => {
    const result = applyMoveToStageMap(stageMap, 1, 2, 0, d1, 1);
    const source = result.find((s) => s.stageId === 1)!;

    expect(source.deals).toEqual([d2]);
    expect(source.totalCount).toBe(1);
  });

  it("should insert the deal into the target stage with its stageId updated and increment totalCount", () => {
    const result = applyMoveToStageMap(stageMap, 1, 2, 1, d1, 1);
    const target = result.find((s) => s.stageId === 2)!;

    expect(target.deals).toEqual([d3, { ...d1, stageId: 2 }, d4]);
    expect(target.totalCount).toBe(3);
  });

  it("should insert at the beginning when insertIndex is 0", () => {
    const result = applyMoveToStageMap(stageMap, 1, 2, 0, d1, 1);
    const target = result.find((s) => s.stageId === 2)!;

    expect(target.deals[0]).toEqual({ ...d1, stageId: 2 });
  });

  it("should insert at the end when insertIndex equals target deals length", () => {
    const result = applyMoveToStageMap(stageMap, 1, 2, 2, d1, 1);
    const target = result.find((s) => s.stageId === 2)!;

    expect(target.deals).toEqual([d3, d4, { ...d1, stageId: 2 }]);
  });

  it("should not modify unrelated stages", () => {
    const result = applyMoveToStageMap(stageMap, 1, 2, 0, d1, 1);
    const other = result.find((s) => s.stageId === 3)!;

    expect(other).toBe(otherStage);
  });
});

// ─── computeReorderWithinStage (reorder within stage) ────────────────────────

describe("computeReorderWithinStage", () => {
  const d1 = mkSliceDeal(1);
  const d2 = mkSliceDeal(2);
  const d3 = mkSliceDeal(3);
  const sourceDeals = [d1, d2, d3];

  it("should reorder and return correct neighbours when moving to last position", () => {
    // arrayMove([d1,d2,d3], 0, 2) → [d2, d3, d1]
    const result = computeReorderWithinStage(sourceDeals, 1, 3);

    expect(result).not.toBeNull();
    expect(result!.reorderedDeals).toEqual([d2, d3, d1]);
    expect(result!.previousDealId).toBe(3);
    expect(result!.nextDealId).toBeNull();
  });

  it("should reorder and return correct neighbours when moving to first position", () => {
    // arrayMove([d1,d2,d3], 2, 0) → [d3, d1, d2]
    const result = computeReorderWithinStage(sourceDeals, 3, 1);

    expect(result).not.toBeNull();
    expect(result!.reorderedDeals).toEqual([d3, d1, d2]);
    expect(result!.previousDealId).toBeNull();
    expect(result!.nextDealId).toBe(1);
  });

  it("should return null when activeDealId is not found", () => {
    expect(computeReorderWithinStage(sourceDeals, 999, 1)).toBeNull();
  });

  it("should return null when overDealId is not found", () => {
    expect(computeReorderWithinStage(sourceDeals, 1, 999)).toBeNull();
  });

  it("should return null when active and over resolve to the same index", () => {
    expect(computeReorderWithinStage(sourceDeals, 1, 1)).toBeNull();
  });
});

// ─── mapCreatedDealToSlice ───────────────────────────────────────────────────

describe("mapCreatedDealToSlice", () => {
  const response: CrmDealResponseType = {
    id: 42,
    name: "New Deal",
    description: null,
    stage: mkStageType(7),
    priority: CrmPriorityEnum.HIGH,
    orderIndex: "a0",
    amount: "1500",
    contact: CONTACT_WITH_COMPANY,
    owner: OWNER
  };

  it("should build a slice from the created deal response", () => {
    const result = mapCreatedDealToSlice(response);

    expect(result).toEqual({
      id: 42,
      name: "New Deal",
      contactName: "Acme Lead",
      companyName: "Acme Corp",
      owner: OWNER,
      amount: "1500",
      priority: CrmPriorityEnum.HIGH,
      taskCount: 0,
      stageId: 7
    });
  });

  it("should read stageId from the nested stage", () => {
    const result = mapCreatedDealToSlice({
      ...response,
      stage: mkStageType(3)
    });

    expect(result.stageId).toBe(3);
  });

  it("should default contactName to an empty string when absent", () => {
    const result = mapCreatedDealToSlice({ ...response, contact: null });

    expect(result.contactName).toBe("");
  });

  it("should keep companyName null when absent", () => {
    const result = mapCreatedDealToSlice({
      ...response,
      contact: CONTACT_NO_COMPANY
    });

    expect(result.companyName).toBeNull();
  });
});

// ─── updateDealInStageMap ────────────────────────────────────────────────────

describe("updateDealInStageMap", () => {
  it("should return the same stage map when the deal is not found", () => {
    const stageMap = [mkStageEntry(10, [mkSliceDeal(1)])];
    const result = updateDealInStageMap(stageMap, mkSliceDeal(99));

    expect(result).toBe(stageMap);
  });

  it("should update the deal in place when the stage is unchanged", () => {
    const stageMap = [mkStageEntry(10, [mkSliceDeal(1), mkSliceDeal(2)])];
    const result = updateDealInStageMap(stageMap, {
      ...mkSliceDeal(1),
      name: "Renamed Deal",
      amount: "999"
    });

    expect(result[0].deals).toHaveLength(2);
    expect(result[0].deals[0]).toMatchObject({
      id: 1,
      name: "Renamed Deal",
      amount: "999",
      stageId: 10
    });
    expect(result[0].totalCount).toBe(2);
  });

  it("should preserve the existing taskCount when updating in place", () => {
    const existing = { ...mkSliceDeal(1), taskCount: 7 };
    const stageMap = [mkStageEntry(10, [existing])];

    // incoming deal's taskCount must not overwrite the stored value
    const result = updateDealInStageMap(stageMap, mkSliceDeal(1));

    expect(result[0].deals[0].taskCount).toBe(7);
  });

  it("should move the deal to the target stage and adjust totalCounts", () => {
    const stageMap = [
      mkStageEntry(10, [mkSliceDeal(1), mkSliceDeal(2)]),
      mkStageEntry(20, [mkSliceDeal(3, 20)])
    ];

    const result = updateDealInStageMap(stageMap, {
      ...mkSliceDeal(1),
      stageId: 20
    });

    const source = result.find((s) => s.stageId === 10)!;
    const target = result.find((s) => s.stageId === 20)!;

    expect(source.deals.map((d) => d.id)).toEqual([2]);
    expect(source.totalCount).toBe(1);

    expect(target.deals.map((d) => d.id)).toEqual([3, 1]);
    expect(target.totalCount).toBe(2);
    expect(target.deals.find((d) => d.id === 1)?.stageId).toBe(20);
  });

  it("should preserve the existing taskCount when moving across stages", () => {
    const stageMap = [
      mkStageEntry(10, [{ ...mkSliceDeal(1), taskCount: 4 }]),
      mkStageEntry(20, [])
    ];

    const result = updateDealInStageMap(stageMap, {
      ...mkSliceDeal(1),
      stageId: 20
    });

    const moved = result
      .find((s) => s.stageId === 20)!
      .deals.find((d) => d.id === 1);

    expect(moved?.taskCount).toBe(4);
  });

  it("should not mutate the original stage map", () => {
    const stageMap = [mkStageEntry(10, [mkSliceDeal(1)])];
    const snapshot = JSON.stringify(stageMap);

    updateDealInStageMap(stageMap, { ...mkSliceDeal(1), name: "Changed" });

    expect(JSON.stringify(stageMap)).toBe(snapshot);
  });
});

// ─── replaceStagesInStageMap ─────────────────────────────────────────────────

describe("replaceStagesInStageMap", () => {
  it("should replace matching stages and keep the rest untouched", () => {
    const stageMap = [
      mkStageEntry(10, [mkSliceDeal(1), mkSliceDeal(2)]),
      mkStageEntry(20, [mkSliceDeal(3, 20)]),
      mkStageEntry(30, [mkSliceDeal(4, 30)])
    ];
    const refreshedSource = mkStageEntry(10, [mkSliceDeal(2)]);
    const refreshedTarget = mkStageEntry(20, [
      mkSliceDeal(3, 20),
      mkSliceDeal(1, 20)
    ]);

    const result = replaceStagesInStageMap(stageMap, [
      refreshedSource,
      refreshedTarget
    ]);

    expect(result[0]).toBe(refreshedSource);
    expect(result[1]).toBe(refreshedTarget);
    expect(result[2]).toBe(stageMap[2]);
  });

  it("should preserve the original stage order", () => {
    const stageMap = [
      mkStageEntry(10, []),
      mkStageEntry(20, []),
      mkStageEntry(30, [])
    ];

    const result = replaceStagesInStageMap(stageMap, [
      mkStageEntry(30, [mkSliceDeal(1, 30)]),
      mkStageEntry(10, [mkSliceDeal(2, 10)])
    ]);

    expect(result.map((s) => s.stageId)).toEqual([10, 20, 30]);
  });

  it("should return an equivalent map when no stages match", () => {
    const stageMap = [mkStageEntry(10, [mkSliceDeal(1)])];

    const result = replaceStagesInStageMap(stageMap, [mkStageEntry(99, [])]);

    expect(result).toEqual(stageMap);
  });
});
