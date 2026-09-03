import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import {
  CrmDealColumnFieldEnum,
  CrmDealFieldConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

import {
  applyColumnVisibility,
  applyColumnWidth,
  fromListTableSortConfig,
  mapConfigSortToQuery,
  reorderConfigFields,
  toListTableSortConfig
} from "./dealListViewUtil";

const field = (
  name: CrmDealColumnFieldEnum,
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
  field(CrmDealColumnFieldEnum.DEAL_NAME, { isHideable: false }),
  field(CrmDealColumnFieldEnum.VALUE),
  field(CrmDealColumnFieldEnum.STAGE)
];

describe("mapConfigSortToQuery", () => {
  it("returns no query params when there is no sort", () => {
    expect(mapConfigSortToQuery(null)).toEqual({});
    expect(mapConfigSortToQuery(undefined)).toEqual({});
  });

  it("maps a column field to its backend sort key", () => {
    expect(
      mapConfigSortToQuery({
        field: CrmDealColumnFieldEnum.VALUE,
        direction: SortOrderTypes.DESC
      })
    ).toEqual({
      sortKey: CrmDealSortEnum.AMOUNT,
      sortOrder: SortOrderTypes.DESC
    });
  });
});

describe("toListTableSortConfig", () => {
  it("returns an empty list when nothing is sorted", () => {
    expect(toListTableSortConfig(null)).toEqual([]);
  });

  it("returns a single entry for the active sort", () => {
    expect(
      toListTableSortConfig({
        field: CrmDealColumnFieldEnum.STAGE,
        direction: SortOrderTypes.ASC
      })
    ).toEqual([
      { columnId: CrmDealColumnFieldEnum.STAGE, direction: SortOrderTypes.ASC }
    ]);
  });
});

describe("fromListTableSortConfig", () => {
  it("clears the sort when the table reports none", () => {
    expect(fromListTableSortConfig([], null)).toBeNull();
  });

  it("picks the entry that differs from the current sort", () => {
    const current = {
      field: CrmDealColumnFieldEnum.VALUE,
      direction: SortOrderTypes.ASC
    };
    expect(
      fromListTableSortConfig(
        [
          { columnId: CrmDealColumnFieldEnum.VALUE, direction: "ASC" },
          { columnId: CrmDealColumnFieldEnum.STAGE, direction: "DESC" }
        ],
        current
      )
    ).toEqual({
      field: CrmDealColumnFieldEnum.STAGE,
      direction: SortOrderTypes.DESC
    });
  });

  it("normalises the direction reported by the table", () => {
    expect(
      fromListTableSortConfig(
        [{ columnId: CrmDealColumnFieldEnum.STAGE, direction: "desc" }],
        null
      )
    ).toEqual({
      field: CrmDealColumnFieldEnum.STAGE,
      direction: SortOrderTypes.DESC
    });
  });
});

describe("reorderConfigFields", () => {
  it("reorders the stored fields to match the column order", () => {
    const next = reorderConfigFields(fields, [
      { id: CrmDealColumnFieldEnum.STAGE, visible: true },
      { id: CrmDealColumnFieldEnum.DEAL_NAME, visible: true },
      { id: CrmDealColumnFieldEnum.VALUE, visible: true }
    ]);
    expect(next?.map((item) => item.field)).toEqual([
      CrmDealColumnFieldEnum.STAGE,
      CrmDealColumnFieldEnum.DEAL_NAME,
      CrmDealColumnFieldEnum.VALUE
    ]);
  });

  it("returns null when the columns do not cover every stored field", () => {
    expect(
      reorderConfigFields(fields, [
        { id: CrmDealColumnFieldEnum.STAGE, visible: true }
      ])
    ).toBeNull();
  });
});

describe("applyColumnVisibility", () => {
  it("hides a hideable column and keeps a non-hideable one visible", () => {
    const next = applyColumnVisibility(fields, [
      { id: CrmDealColumnFieldEnum.DEAL_NAME, visible: false },
      { id: CrmDealColumnFieldEnum.VALUE, visible: false }
    ]);
    expect(next[0].isVisible).toBe(true);
    expect(next[1].isVisible).toBe(false);
  });
});

describe("applyColumnWidth", () => {
  it("updates only the matching column", () => {
    const next = applyColumnWidth(fields, CrmDealColumnFieldEnum.VALUE, 250);
    expect(next[1].width).toBe(250);
    expect(next[0].width).toBe(100);
  });

  it("leaves the fields untouched when the column is unknown", () => {
    expect(applyColumnWidth(fields, "UNKNOWN", 250)).toEqual(fields);
  });
});
