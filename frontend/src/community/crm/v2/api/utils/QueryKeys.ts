import {
  CrmTaskCompletedFilterRequest,
  CrmTaskFilterRequest
} from "~community/crm/v2/types/CrmTypes";

/**
 * Every v2 key carries this prefix so v1 and v2 hooks can never share a React
 * Query cache entry while their response shapes differ.
 */
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
  RELATED_TASKS: [V2, "crm-related-tasks"],
  RELATED_TASKS_BY_ID: (id: number, size: number) => [
    V2,
    "crm-related-tasks",
    id,
    size
  ]
};

export const crmDealQueryKeys = {
  DEALS_BY_IDS: (dealIds: number[]) => [V2, "crm-deals-by-ids", dealIds]
};

export const crmCompanyQueryKeys = {
  COMPANIES_BY_IDS: (companyIds: number[]) => [
    V2,
    "crm-companies-by-ids",
    companyIds
  ]
};
