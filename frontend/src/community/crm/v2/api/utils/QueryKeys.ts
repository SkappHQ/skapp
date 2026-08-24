import {
  CrmDealFilterRequest,
  CrmDealsByStagesRequest,
  CrmTaskCompletedFilterRequest,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const V2 = "v2";

export const crmTaskQueryKeys = {
  OPEN_TASKS: [V2, "crm-open-tasks"],
  OPEN_TASKS_BY_FILTER: (filter: CrmTaskFilterRequest) => [
    V2,
    "crm-open-tasks",
    filter
  ],
  COMPLETED_TASKS: [V2, "crm-completed-tasks"],
  COMPLETED_TASKS_BY_FILTER: (filter: CrmTaskCompletedFilterRequest) => [
    V2,
    "crm-completed-tasks",
    filter
  ],
  TASK_BY_ID: (id: number) => [V2, "crm-task-by-id", id],
  RELATED_TASKS: [V2, "crm-related-tasks"],
  RELATED_TASKS_BY_ID: (id: number, size: number) => [
    V2,
    "crm-related-tasks",
    id,
    size
  ]
};

export const crmDealQueryKeys = {
  DEALS_BY_IDS: (dealIds: number[]) => [V2, "crm-deals-by-ids", dealIds],
  GET_DEALS: (filters: CrmDealFilterRequest) => ["crm-deals-v2", filters],
  DEAL_BY_ID: (id: number) => ["crm-deal-v2", id],
  CHECK_DEAL_NAME_EXISTS: (name: string) => ["crm-deal-name-exists-v2", name],
  DEAL_STAGES: ["crm-deal-stages-v2"]
};

export const crmCompanyQueryKeys = {
  COMPANIES_BY_IDS: (companyIds: number[]) => [
    V2,
    "crm-companies-by-ids",
    companyIds
  ]
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
