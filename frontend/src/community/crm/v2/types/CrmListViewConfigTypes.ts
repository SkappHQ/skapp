import { BaseRowData } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealSortEnum } from "~community/crm/v2/enums/common";

export interface CrmDealFieldConfig {
  field: CrmDealSortEnum;
  width: number;
  isVisible: boolean;
  isHideable: boolean;
  isSortable: boolean;
  isDraggable: boolean;
  isGroupable: boolean;
  isResizable: boolean;
}

export interface CrmDealSortConfig {
  field: CrmDealSortEnum;
  direction: SortOrderTypes;
}

export interface CrmDealListViewConfig {
  fields: CrmDealFieldConfig[];
  sort: CrmDealSortConfig | null;
}

export interface ColumnState {
  id: string;
  visible: boolean;
}

export interface DealRow extends BaseRowData {
  id: string;
  dealName: ReactNode;
  value: ReactNode;
  stage: ReactNode;
  companyName: ReactNode;
  contactName: ReactNode;
  priority: ReactNode;
  dealOwner: ReactNode;
}
