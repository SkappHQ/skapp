import { SortOrderTypes } from "~community/common/types/CommonTypes";

export enum CrmDealColumnFieldEnum {
  DEAL_NAME = "DEAL_NAME",
  VALUE = "VALUE",
  STAGE = "STAGE",
  COMPANY_NAME = "COMPANY_NAME",
  CONTACT_NAME = "CONTACT_NAME",
  PRIORITY = "PRIORITY",
  DEAL_OWNER = "DEAL_OWNER"
}

export interface CrmDealFieldConfig {
  field: CrmDealColumnFieldEnum;
  width: number;
  isVisible: boolean;
  isHideable: boolean;
  isSortable: boolean;
  isDraggable: boolean;
  isGroupable: boolean;
  isResizable: boolean;
}

export interface CrmDealSortConfig {
  field: CrmDealColumnFieldEnum;
  direction: SortOrderTypes;
}

export interface CrmDealListViewConfig {
  fields: CrmDealFieldConfig[];
  sort: CrmDealSortConfig | null;
}
