import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  ALL: ["crm-deals"],
  GET_DEALS: (params: CrmDealFilterParams) => ["crm-deals", params],
  DEAL_STAGES: ["crm-deal-stages"]
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
  OWNERS_LOOKUP: (searchKeyword: string) => ["crm-owners-lookup", searchKeyword],
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
  CRM_COMPANIES: (size: number) => ["crm-companies", size]
};

export const taskQueryKeys = {
  GET_TASK_DATA: ["get-task-data"]
};
