import {
  CrmCompanyFilterRequest,
  CrmDealFilterRequest,
  CrmDealsByStagesRequest,
  CrmRelatedTasksFilterRequest,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";

export const crmTaskQueryKeys = {
  TASKS: (filter: CrmTaskFilterRequest) => ["crm-tasks-v2", filter],
  COMPLETED_TASKS: (filter: CrmTaskFilterRequest) => [
    "crm-completed-tasks-v2",
    filter
  ],
  TASK_BY_ID: (id: number) => ["crm-task-by-id-v2", id],
  RELATED_TASKS: (filter: CrmRelatedTasksFilterRequest) => [
    "crm-related-tasks-v2",
    filter
  ]
};

const CRM_DEALS_V2 = "crm-deals-v2";

export const crmDealQueryKeys = {
  GET_DEALS_ROOT: [CRM_DEALS_V2],
  DEALS_BY_IDS: (dealIds: number[]) => ["crm-deals-by-ids-v2", dealIds],
  GET_DEALS: (filters: CrmDealFilterRequest) => [CRM_DEALS_V2, filters],
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
