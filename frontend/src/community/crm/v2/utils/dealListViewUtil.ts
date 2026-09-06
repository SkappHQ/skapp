import { SortConfig } from "@rootcodelabs/skapp-ui";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import {
  ColumnState,
  CrmDealFieldConfig,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

const toSortOrder = (direction: string): SortOrderTypes =>
  direction?.toUpperCase() === SortOrderTypes.DESC
    ? SortOrderTypes.DESC
    : SortOrderTypes.ASC;

export const fromListTableSortConfig = (
  sortConfig: SortConfig[],
  current: CrmDealSortConfig | null
): CrmDealSortConfig | null => {
  if (!sortConfig.length) return null;
  const changed = sortConfig.find(
    (config) =>
      config.columnId !== current?.field ||
      toSortOrder(config.direction) !== current?.direction
  );
  if (!changed) return current;
  return {
    field: changed.columnId as CrmDealSortEnum,
    direction: toSortOrder(changed.direction)
  };
};

export const reorderConfigFields = (
  fields: CrmDealFieldConfig[],
  columns: ReadonlyArray<ColumnState>
): CrmDealFieldConfig[] | null => {
  const byField = new Map<CrmDealSortEnum, CrmDealFieldConfig>(
    fields.map((field) => [field.field, field])
  );
  const reordered = columns
    .map((column) => byField.get(column.id as CrmDealSortEnum))
    .filter((field): field is CrmDealFieldConfig => Boolean(field));
  if (!reordered.length) return null;

  const reportedFields = new Set(reordered.map((field) => field.field));
  const nextFields = [...reordered];
  fields.forEach((field, index) => {
    if (!reportedFields.has(field.field)) nextFields.splice(index, 0, field);
  });
  return nextFields;
};

export const applyColumnVisibility = (
  fields: CrmDealFieldConfig[],
  columns: ReadonlyArray<ColumnState>
): CrmDealFieldConfig[] => {
  const visibilityById = new Map(
    columns.map((column) => [column.id, column.visible])
  );
  return fields.map((field) => ({
    ...field,
    isVisible: field.isHideable
      ? (visibilityById.get(field.field) ?? field.isVisible)
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
