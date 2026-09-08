import { SortConfig } from "@rootcodelabs/skapp-ui";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import {
  ColumnState,
  CrmDealFieldConfig,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

const toSortOrder = (direction: string): SortOrderTypes =>
  direction.toUpperCase() === SortOrderTypes.DESC
    ? SortOrderTypes.DESC
    : SortOrderTypes.ASC;

export const resolveSortChange = (
  reported: SortConfig[],
  current: CrmDealSortConfig | null
): CrmDealSortConfig | null => {
  if (!reported.length) return null;

  const changed = reported.find(
    (column) =>
      column.columnId !== current?.field ||
      toSortOrder(column.direction) !== current?.direction
  );
  if (!changed) return current;

  return {
    field: changed.columnId as CrmDealSortEnum,
    direction: toSortOrder(changed.direction)
  };
};

export const applyColumnOrder = (
  fields: CrmDealFieldConfig[],
  columns: ReadonlyArray<ColumnState>
): CrmDealFieldConfig[] | null => {
  const fieldById = new Map<CrmDealSortEnum, CrmDealFieldConfig>(
    fields.map((field) => [field.field, field])
  );

  const orderedFields = columns
    .map((column) => fieldById.get(column.id as CrmDealSortEnum))
    .filter((field): field is CrmDealFieldConfig => Boolean(field));
  if (!orderedFields.length) return null;

  const orderedQueue = [...orderedFields];
  const isOrdered = new Set(orderedFields.map((field) => field.field));

  return fields.map((field) =>
    isOrdered.has(field.field) ? orderedQueue.shift()! : field
  );
};

export const applyColumnVisibility = (
  fields: CrmDealFieldConfig[],
  columns: ReadonlyArray<ColumnState>
): CrmDealFieldConfig[] => {
  const isVisibleById = new Map(
    columns.map((column) => [column.id, column.visible])
  );

  return fields.map((field) => ({
    ...field,
    isVisible: field.isHideable
      ? (isVisibleById.get(field.field) ?? field.isVisible)
      : true
  }));
};

export const applyColumnWidth = (
  fields: CrmDealFieldConfig[],
  columnId: string,
  width: number
): CrmDealFieldConfig[] | null => {
  if (!fields.some((field) => field.field === columnId)) return null;

  return fields.map((field) =>
    field.field === columnId ? { ...field, width } : field
  );
};
