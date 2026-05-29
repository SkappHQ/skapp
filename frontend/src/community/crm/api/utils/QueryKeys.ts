import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const CRM_DEALS_KEY = "crm-deals";
export const CRM_CONTACTS_KEY = "crm-contacts";
export const CRM_COMPANIES_KEY = "crm-companies";
export const CRM_COMPANY_LOOKUP_KEY = "crm-company-lookup";
export const CRM_OWNERS_KEY = "crm-owners";

export const crmQueryKeys = {
  ALL: (entity: string) => [entity],
  LIST: (entity: string, searchKeyword?: string) =>
    [entity, "list", searchKeyword].filter((v) => v !== undefined),
  DETAILS: (entity: string, id: string | number) => [entity, "details", id],
  FILTERED: (entity: string, params: Record<string, unknown>) => [
    entity,
    ...Object.values(params).filter((v) => v !== undefined)
  ],
  STAGES: (entity: string) => [entity, "stages"]
};

export const crmDealQueryKeys = {
  GET_DEALS: (params: Omit<CrmDealFilterParams, "page">) => [
    "crm-deals",
    params
  ]
};

export const companyQueryKeys = {
  GET_COMPANY_DATA: ["get-company-data"],
  GET_COMPANY_DATA_BY_SEARCH: (searchKeyword: string, limit: number) => [
    "get-company-data",
    searchKeyword,
    limit
  ],
  CHECK_COMPANY_NAME_EXISTS: ["check-company-name-exists"]
};
