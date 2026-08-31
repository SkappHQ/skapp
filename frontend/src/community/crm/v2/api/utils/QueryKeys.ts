import {
  CrmCompanyFilterRequest,
  CrmDealFilterRequest,
  CrmDealsByStagesRequest
} from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";

export const crmDealQueryKeys = {
  GET_DEALS_ROOT: ["crm-deals-v2"],
  GET_DEALS: (filters: CrmDealFilterRequest) => ["crm-deals-v2", filters],
  DEAL_BY_ID: (id: number) => ["crm-deal-v2", id],
  CHECK_DEAL_NAME_EXISTS: (name: string) => ["crm-deal-name-exists-v2", name],
  DEAL_STAGES: ["crm-deal-stages-v2"],
  LIST_VIEW_CONFIG: ["crm-deal-list-view-config-v2"]
};

export const crmCompanyQueryKeys = {
  ALL: [CRM_COMPANIES],
  COMPANIES_BY_IDS: (ids: number[]) => ["crm-companies-by-ids-v2", ids],
  LIST: (params: CrmCompanyFilterRequest) => [CRM_COMPANIES, "list", params],
  DETAIL: (id: number) => [CRM_COMPANIES, "detail", id],
  METRICS: (id: number) => [CRM_COMPANIES, "metrics", id],
  NAME_EXISTS: (name: string) => [CRM_COMPANIES, "name-exists", name]
};

export const crmLookupQueryKeys = {
  CONTACT_LOOKUP: (searchKeyword: string, size: number) => [
    "crm-contact-lookup-v2",
    searchKeyword,
    size
  ],
  OWNER_LOOKUP: (searchKeyword: string, size: number) => [
    "crm-owner-lookup-v2",
    searchKeyword,
    size
  ]
};

export const crmBoardQueryKeys = {
  BOARD_INIT_DATA: ["crm-board-init-data-v2"],
  DEALS_GROUPED_BY_STAGES: (params: CrmDealsByStagesRequest) => [
    "crm-board-deals-grouped-by-stages-v2",
    params
  ]
};
