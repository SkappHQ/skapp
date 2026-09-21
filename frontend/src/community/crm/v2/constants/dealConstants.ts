import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import { DealRow } from "~community/crm/v2/types/CrmListViewConfigTypes";

export const DEAL_COLUMN_MIN_WIDTH = 100;

export const LINK_COPIED_POPOVER_DURATION = 2000;
export const DEAL_NAME_MAX_LENGTH = 255;
export const DEAL_DESCRIPTION_MAX_LENGTH = 2000;
export const DEAL_SEARCH_DEBOUNCE_DELAY = 300;

export const DEAL_FIELD_META: Partial<
  Record<CrmDealSortEnum, { rowKey: keyof DealRow; titleKey: string }>
> = {
  [CrmDealSortEnum.NAME]: {
    rowKey: "dealName",
    titleKey: "dealColumn"
  },
  [CrmDealSortEnum.AMOUNT]: {
    rowKey: "value",
    titleKey: "valueColumn"
  },
  [CrmDealSortEnum.STAGE]: {
    rowKey: "stage",
    titleKey: "stageColumn"
  },
  [CrmDealSortEnum.COMPANY]: {
    rowKey: "companyName",
    titleKey: "companyNameColumn"
  },
  [CrmDealSortEnum.CONTACT]: {
    rowKey: "contactName",
    titleKey: "contactNameColumn"
  },
  [CrmDealSortEnum.PRIORITY]: {
    rowKey: "priority",
    titleKey: "priorityColumn"
  },
  [CrmDealSortEnum.OWNER]: {
    rowKey: "dealOwner",
    titleKey: "dealOwnerColumn"
  }
};
