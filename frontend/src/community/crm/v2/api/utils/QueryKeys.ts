import {
  CrmCompanyFilterRequest,
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmDealsByStagesRequest,
  CrmOwnerLookupFilterRequest,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";
const CRM_CONTACTS = "crm-contacts";
const CRM_DEALS = "crm-deals";
const CRM_TASKS = "crm-tasks";

export const crmContactQueryKeys = {
  LISTS: [CRM_CONTACTS, "list"],
  LIST: (params: CrmContactFilterRequest) => [CRM_CONTACTS, "list", params],
  DETAIL: (id: number) => [CRM_CONTACTS, "detail", id],
  METRICS: (id: number) => [CRM_CONTACTS, "metrics", id],
  EMAIL_EXISTS: (email: string) => [CRM_CONTACTS, "email-exists", email],
  LOOKUP: (params: CrmContactFilterRequest) => [CRM_CONTACTS, "lookup", params],
  OWNER_LOOKUP: (params: CrmOwnerLookupFilterRequest) => [
    CRM_CONTACTS,
    "owner-lookup",
    params
  ]
};

export const crmTaskQueryKeys = {
  LIST: (params: CrmTaskFilterRequest) => [CRM_TASKS, "list", params]
};

export const crmDealQueryKeys = {
  DEALS_BY_IDS: (dealIds: number[]) => [CRM_DEALS, "by-ids", dealIds],
  GET_DEALS: (filters: CrmDealFilterRequest) => [CRM_DEALS, "list", filters],
  DEAL_BY_ID: (id: number) => [CRM_DEALS, "detail", id],
  CHECK_DEAL_NAME_EXISTS: (name: string) => [CRM_DEALS, "name-exists", name],
  DEAL_STAGES: [CRM_DEALS, "stages"],
  LOOKUP: (params: CrmDealFilterRequest) => [CRM_DEALS, "lookup", params]
};

export const crmCompanyQueryKeys = {
  COMPANIES_BY_IDS: (ids: number[]) => [CRM_COMPANIES, "by-ids", ids],
  LIST: (params: CrmCompanyFilterRequest) => [CRM_COMPANIES, "list", params],
  DETAIL: (id: number) => [CRM_COMPANIES, "detail", id],
  METRICS: (id: number) => [CRM_COMPANIES, "metrics", id],
  NAME_EXISTS: (name: string) => [CRM_COMPANIES, "name-exists", name],
  LOOKUP: (params: CrmCompanyFilterRequest) => [
    CRM_COMPANIES,
    "lookup",
    params
  ],
  DOMAIN_SEARCH: (domain: string) => [CRM_COMPANIES, "domain-search", domain]
};

export const crmBoardQueryKeys = {
  BOARD_INIT_DATA: ["crm-board-init-data-v2"],
  DEALS_GROUPED_BY_STAGES: (params: CrmDealsByStagesRequest) => [
    "crm-board-deals-grouped-by-stages-v2",
    params
  ]
};
