import {
  CrmDealColumnFieldEnum,
  DealRow
} from "~community/crm/v2/types/CrmListViewConfigTypes";

export const DEAL_COLUMN_MIN_WIDTH = 100;

export const DEAL_FIELD_META: Record<
  CrmDealColumnFieldEnum,
  { rowKey: keyof DealRow; titleKey: string }
> = {
  [CrmDealColumnFieldEnum.DEAL_NAME]: {
    rowKey: "dealName",
    titleKey: "dealColumn"
  },
  [CrmDealColumnFieldEnum.VALUE]: {
    rowKey: "value",
    titleKey: "valueColumn"
  },
  [CrmDealColumnFieldEnum.STAGE]: {
    rowKey: "stage",
    titleKey: "stageColumn"
  },
  [CrmDealColumnFieldEnum.COMPANY_NAME]: {
    rowKey: "companyName",
    titleKey: "companyNameColumn"
  },
  [CrmDealColumnFieldEnum.CONTACT_NAME]: {
    rowKey: "contactName",
    titleKey: "contactNameColumn"
  },
  [CrmDealColumnFieldEnum.PRIORITY]: {
    rowKey: "priority",
    titleKey: "priorityColumn"
  },
  [CrmDealColumnFieldEnum.DEAL_OWNER]: {
    rowKey: "dealOwner",
    titleKey: "dealOwnerColumn"
  }
};
