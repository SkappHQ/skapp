import {
  CrmCompanyFilterRequest,
  CrmContactFilterRequest,
  CrmDealFilterRequest,
  CrmOwnerLookupFilterRequest,
  CrmTaskCompletedFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";
const CRM_CONTACTS = "crm-contacts";
const CRM_DEALS = "crm-deals";
const CRM_TASKS = "crm-tasks";

export const crmCompanyQueryKeys = {
  ALL: [CRM_COMPANIES],
  LIST: (params: CrmCompanyFilterRequest) => [CRM_COMPANIES, "list", params],
  DETAIL: (id: number) => [CRM_COMPANIES, "detail", id],
  METRICS: (id: number) => [CRM_COMPANIES, "metrics", id],
  NAME_EXISTS: (name: string) => [CRM_COMPANIES, "name-exists", name]
};

export const crmContactQueryKeys = {
  METRICS: (id: number) => [CRM_CONTACTS, "metrics", id],
  LOOKUP: (params: CrmContactFilterRequest) => [CRM_CONTACTS, "lookup", params],
  OWNER_LOOKUP: (params: CrmOwnerLookupFilterRequest) => [
    CRM_CONTACTS,
    "owner-lookup",
    params
  ]
};

export const crmDealQueryKeys = {
  LOOKUP: (params: CrmDealFilterRequest) => [CRM_DEALS, "lookup", params]
};

export const crmTaskQueryKeys = {
  ALL: [CRM_TASKS],
  LIST: (params: CrmTaskCompletedFilterRequest) => [CRM_TASKS, "list", params]
};
