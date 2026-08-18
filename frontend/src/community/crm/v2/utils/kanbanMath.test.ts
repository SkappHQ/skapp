import type { ClientRect } from "@dnd-kit/core";

import {
  computeInsertIndex,
  computeMoveNeighbors,
  computeReorderWithinStage,
  resolveInsertIndex
} from "./kanbanMath";

const rect = (top: number, height = 100): ClientRect => ({
  top,
  height,
  bottom: top + height,
  left: 0,
  right: 0,
  width: 0
});

// ─── computeReorderWithinStage ───────────────────────────────────────────────

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

// ─── computeInsertIndex ──────────────────────────────────────────────────────

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

// ─── resolveInsertIndex ──────────────────────────────────────────────────────

describe("resolveInsertIndex", () => {
  const targetDealIds = [10, 20, 30];

  it("appends to the end when dropping on the column container", () => {
    expect(
      resolveInsertIndex(true, targetDealIds, 20, rect(0), rect(0))
    ).toBe(3);
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

// ─── computeMoveNeighbors ────────────────────────────────────────────────────

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
