import {
  CrmDealColumnFieldEnum,
  DealRow
} from "~community/crm/v2/types/CrmListViewConfigTypes";

export const DEAL_FIELD_META: Record<
  CrmDealColumnFieldEnum,
  { rowKey: keyof DealRow; titleKey: string; minWidth: number }
> = {
  [CrmDealColumnFieldEnum.DEAL_NAME]: {
    rowKey: "dealName",
    titleKey: "dealColumn",
    minWidth: 400
  },
  [CrmDealColumnFieldEnum.VALUE]: {
    rowKey: "value",
    titleKey: "valueColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.STAGE]: {
    rowKey: "stage",
    titleKey: "stageColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.COMPANY_NAME]: {
    rowKey: "companyName",
    titleKey: "companyNameColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.CONTACT_NAME]: {
    rowKey: "contactName",
    titleKey: "contactNameColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.PRIORITY]: {
    rowKey: "priority",
    titleKey: "priorityColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.DEAL_OWNER]: {
    rowKey: "dealOwner",
    titleKey: "dealOwnerColumn",
    minWidth: 140
  }
};
