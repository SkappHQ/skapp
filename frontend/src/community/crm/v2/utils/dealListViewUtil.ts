import { SortConfig } from "@rootcodelabs/skapp-ui";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import {
  CrmDealColumnFieldEnum,
  CrmDealSortConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";

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

export const mapConfigSortToQuery = (
  sort: CrmDealSortConfig | null | undefined
): { sortKey?: CrmDealSortEnum; sortOrder?: SortOrderTypes } =>
  sort
    ? { sortKey: FIELD_TO_SORT_KEY[sort.field], sortOrder: sort.direction }
    : {};

export const toListTableSortConfig = (
  sort: CrmDealSortConfig | null | undefined
): SortConfig[] =>
  sort ? [{ columnId: sort.field, direction: sort.direction }] : [];

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
