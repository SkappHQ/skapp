import { SortConfig } from "@rootcodelabs/skapp-ui";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import { CrmDealFieldConfig } from "~community/crm/v2/types/CrmListViewConfigTypes";

import {
  applyColumnOrder,
  applyColumnVisibility,
  applyColumnWidth,
  resolveSortChange
} from "./dealListViewUtil";

const field = (
  name: CrmDealSortEnum,
  overrides: Partial<CrmDealFieldConfig> = {}
): CrmDealFieldConfig => ({
  field: name,
  width: 100,
  isVisible: true,
  isHideable: true,
  isSortable: true,
  isDraggable: true,
  isGroupable: false,
  isResizable: true,
  ...overrides
});

const fields = [
  field(CrmDealSortEnum.NAME, { isHideable: false }),
  field(CrmDealSortEnum.AMOUNT),
  field(CrmDealSortEnum.STAGE)
];

describe("resolveSortChange", () => {
  it("clears the sort when the table reports none", () => {
    expect(resolveSortChange([], null)).toBeNull();
  });

  it("picks the entry that differs from the current sort", () => {
    const current = {
      field: CrmDealSortEnum.AMOUNT,
      direction: SortOrderTypes.ASC
    };
    expect(
      resolveSortChange(
        [
          { columnId: CrmDealSortEnum.AMOUNT, direction: "ASC" },
          { columnId: CrmDealSortEnum.STAGE, direction: "DESC" }
        ],
        current
      )
    ).toEqual({
      field: CrmDealSortEnum.STAGE,
      direction: SortOrderTypes.DESC
    });
  });

  it("normalises the direction reported by the table", () => {
    expect(
      resolveSortChange(
        [
          {
            columnId: CrmDealSortEnum.STAGE,
            direction: "desc" as SortConfig["direction"]
          }
        ],
        null
      )
    ).toEqual({
      field: CrmDealSortEnum.STAGE,
      direction: SortOrderTypes.DESC
    });
  });
});

describe("applyColumnOrder", () => {
  it("reorders the stored fields to match the column order", () => {
    const next = applyColumnOrder(fields, [
      { id: CrmDealSortEnum.STAGE, visible: true },
      { id: CrmDealSortEnum.NAME, visible: true },
      { id: CrmDealSortEnum.AMOUNT, visible: true }
    ]);
    expect(next?.map((item) => item.field)).toEqual([
      CrmDealSortEnum.STAGE,
      CrmDealSortEnum.NAME,
      CrmDealSortEnum.AMOUNT
    ]);
  });

  it("keeps fields the table did not report at their original index", () => {
    const next = applyColumnOrder(fields, [
      { id: CrmDealSortEnum.STAGE, visible: true },
      { id: CrmDealSortEnum.AMOUNT, visible: true }
    ]);
    expect(next?.map((item) => item.field)).toEqual([
      CrmDealSortEnum.NAME,
      CrmDealSortEnum.STAGE,
      CrmDealSortEnum.AMOUNT
    ]);
  });

  it("returns null when no reported column matches a stored field", () => {
    expect(
      applyColumnOrder(fields, [{ id: "UNKNOWN", visible: true }])
    ).toBeNull();
  });
});

describe("applyColumnVisibility", () => {
  it("hides a hideable column and keeps a non-hideable one visible", () => {
    const next = applyColumnVisibility(fields, [
      { id: CrmDealSortEnum.NAME, visible: false },
      { id: CrmDealSortEnum.AMOUNT, visible: false }
    ]);
    expect(next[0].isVisible).toBe(true);
    expect(next[1].isVisible).toBe(false);
  });
});

describe("applyColumnWidth", () => {
  it("updates only the matching column", () => {
    const next = applyColumnWidth(fields, CrmDealSortEnum.AMOUNT, 250);
    expect(next?.[1].width).toBe(250);
    expect(next?.[0].width).toBe(100);
  });

  it("returns null when the column id matches no stored field", () => {
    expect(applyColumnWidth(fields, "UNKNOWN", 250)).toBeNull();
  });
});
