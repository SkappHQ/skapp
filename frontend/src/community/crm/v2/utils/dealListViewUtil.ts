import { SortConfig } from "@rootcodelabs/skapp-ui";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import {
  CrmDealColumnFieldEnum,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

/** Maps a table column to the backend sort key used to sort by that column. */
export const FIELD_TO_SORT_KEY: Record<
  CrmDealColumnFieldEnum,
  CrmDealSortEnum
> = {
  [CrmDealColumnFieldEnum.DEAL_NAME]: CrmDealSortEnum.NAME,
  [CrmDealColumnFieldEnum.VALUE]: CrmDealSortEnum.AMOUNT,
  [CrmDealColumnFieldEnum.STAGE]: CrmDealSortEnum.STAGE_ORDER,
  [CrmDealColumnFieldEnum.COMPANY_NAME]: CrmDealSortEnum.COMPANY_NAME,
  [CrmDealColumnFieldEnum.CONTACT_NAME]: CrmDealSortEnum.CONTACT_NAME,
  [CrmDealColumnFieldEnum.PRIORITY]: CrmDealSortEnum.PRIORITY,
  [CrmDealColumnFieldEnum.DEAL_OWNER]: CrmDealSortEnum.OWNER
};

/**
 * Derives the deals-query sort params from the saved active sort. Returns an empty object
 * when no sort is active, so the backend falls back to the saved row (list) order.
 */
export const mapConfigSortToQuery = (
  sort: CrmDealSortConfig | null | undefined
): { sortKey?: CrmDealSortEnum; sortOrder?: SortOrderTypes } =>
  sort
    ? { sortKey: FIELD_TO_SORT_KEY[sort.field], sortOrder: sort.direction }
    : {};

/** Builds the ListTable sortConfig from the saved active sort. */
export const toListTableSortConfig = (
  sort: CrmDealSortConfig | null | undefined
): SortConfig[] =>
  sort ? [{ columnId: sort.field, direction: sort.direction }] : [];

/** Converts a ListTable onSort payload back into the saved-config sort shape. */
export const fromListTableSortConfig = (
  sortConfig: SortConfig[],
  current: CrmDealSortConfig | null
): CrmDealSortConfig | null => {
  if (!sortConfig.length) return null;
  const changed =
    sortConfig.find(
      (config) =>
        config.columnId !== current?.field ||
        config.direction !== current?.direction
    ) ?? sortConfig[sortConfig.length - 1];
  return {
    field: changed.columnId as CrmDealColumnFieldEnum,
    direction: changed.direction as SortOrderTypes
  };
};
