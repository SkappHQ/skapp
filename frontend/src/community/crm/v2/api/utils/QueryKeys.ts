import {
  CrmCompanyFilterRequest,
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmDealsByStagesRequest,
  CrmOwnerLookupFilterRequest,
  CrmRelatedTasksFilter,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";
const CRM_CONTACTS = "crm-contacts";
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
  LISTS: [CRM_TASKS, "list"],
  LIST: (params: CrmTaskFilterRequest) => [CRM_TASKS, "list", params],
  COMPLETED_LIST: (params: CrmTaskFilterRequest) => [
    CRM_TASKS,
    "completed-list",
    params
  ],
  TASK_BY_ID: (id: number) => ["crm-task-by-id-v2", id],
  RELATED_TASKS: (id: number, filter: CrmRelatedTasksFilter) => [
    "crm-related-tasks-v2",
    id,
    filter
  ]
};

export const crmDealQueryKeys = {
  GET_DEALS_ROOT: ["crm-deals-v2"],
  DEALS_BY_IDS: (dealIds: number[]) => ["crm-deals-by-ids-v2", dealIds],
  GET_DEALS: (filters: CrmDealFilterRequest) => ["crm-deals-v2", filters],
  DEAL_BY_ID: (id: number) => ["crm-deal-v2", id],
  CHECK_DEAL_NAME_EXISTS: (name: string) => ["crm-deal-name-exists-v2", name],
  DEAL_STAGES: ["crm-deal-stages-v2"],
  LIST_VIEW_CONFIG: ["crm-deal-list-view-config-v2"],
  LOOKUP: (params: CrmDealFilterRequest) => ["crm-deal-lookup-v2", params]
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
