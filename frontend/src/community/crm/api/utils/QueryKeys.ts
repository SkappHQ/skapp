import { CrmBoardDealsGroupedRequest } from "~community/crm/types/BoardTypes";
import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  ALL: ["crm-deals"],
  GET_DEALS: (params: CrmDealFilterParams) => ["crm-deals", params],
  DEAL_STAGES: ["crm-deal-stages"],
  DEAL_LOOKUP: (searchKeyword: string) => ["crm-deal-lookup", searchKeyword],
  DEAL_BY_ID: (id: number) => ["crm-deal", id]
};

export const crmBoardQueryKeys = {
  BOARD_INIT_DATA: ["crm-board-init-data"],
  DEALS_GROUPED_BY_STAGES: ["crm-board-deals-grouped-by-stages"],
  GET_DEALS_GROUPED_BY_STAGES: (params: CrmBoardDealsGroupedRequest) => [
    "crm-board-deals-grouped-by-stages",
    params
  ]
};

export const contactQueryKeys = {
  GET_CONTACT_DATA: ["crm-contacts"],
  ALL: ["crm-contacts"],
  GET_CONTACT_DATA_BY_SEARCH: (searchKeyword: string, companyId?: number) => [
    "crm-contacts",
    searchKeyword,
    companyId
  ],
  CRM_COMPANIES: ["crm-companies"],
  COMPANY_LOOKUP: (searchKeyword: string) => [
    "crm-company-lookup",
    searchKeyword
  ],
  OWNERS_LOOKUP: (searchKeyword: string) => [
    "crm-owners-lookup",
    searchKeyword
  ],
  CONTACT_LOOKUP: (searchKeyword: string, size: number) => [
    "crm-contacts-lookup",
    searchKeyword,
    size
  ],
  OWNER_LOOKUP: (searchKeyword: string, size: number) => [
    "crm-owners-lookup",
    searchKeyword,
    size
  ],
  CONTACT_BY_ID: (id: number) => ["crm-contact-by-id", id]
};

export const companyQueryKeys = {
  GET_COMPANY_DATA: ["get-company-data"],
  GET_COMPANY_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "get-company-data",
    searchKeyword,
    limit
  ],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"],
  CRM_COMPANIES: (size: number) => ["crm-companies", size],
  SEARCH_COMPANIES_BY_DOMAIN: (domain: string) => [
    "search-companies-by-domain",
    domain
  ]
};

export const taskQueryKeys = {
  GET_TASK_DATA: ["get-task-data"],
  GET_TASK_DATA_BY_ID: (id: number) => ["get-task-data", id],
  GET_OPEN_TASKS: ["get-open-tasks"],
  GET_OPEN_TASKS_BY_SEARCH: (searchKeyword?: string) => [
    "get-open-tasks",
    searchKeyword
  ],
  GET_COMPLETED_TASKS: ["get-completed-tasks"],
  GET_COMPLETED_TASKS_BY_SEARCH: (searchKeyword: string) => [
    "get-completed-tasks",
    searchKeyword
  ],
  RELATED_TASKS: ["crm-related-tasks"],
  GET_TASK_TYPES: ["get-task-types"],
  GET_TASK_BY_ID: (id: number) => ["get-task-by-id", id]
};
