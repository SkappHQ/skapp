import { CrmDealSortEnum } from "~community/crm/v2/enums/common";
import { DealRow } from "~community/crm/v2/types/CrmListViewConfigTypes";

export const DEAL_COLUMN_MIN_WIDTH = 100;

export const LINK_COPIED_POPOVER_DURATION = 2000;
export const DEAL_NAME_MAX_LENGTH = 255;

export const DEAL_FIELD_META: Partial<
  Record<CrmDealSortEnum, { rowKey: keyof DealRow; titleKey: string }>
> = {
  [CrmDealSortEnum.NAME]: {
    rowKey: "dealName",
    titleKey: "deal"
  },
  [CrmDealSortEnum.AMOUNT]: {
    rowKey: "value",
    titleKey: "value"
  },
  [CrmDealSortEnum.STAGE]: {
    rowKey: "stage",
    titleKey: "stage"
  },
  [CrmDealSortEnum.COMPANY]: {
    rowKey: "companyName",
    titleKey: "companyName"
  },
  [CrmDealSortEnum.CONTACT]: {
    rowKey: "contactName",
    titleKey: "contactName"
  },
  [CrmDealSortEnum.PRIORITY]: {
    rowKey: "priority",
    titleKey: "priority"
  },
  [CrmDealSortEnum.OWNER]: {
    rowKey: "dealOwner",
    titleKey: "dealOwner"
  }
};
