import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  ALL: ["crm-deals"],
  GET_DEALS: (params: CrmDealFilterParams) => ["crm-deals", params],
  DEAL_STAGES: ["crm-deal-stages"]
};

export const contactQueryKeys = {
  ALL: ["crm-contacts"],
  GET_CONTACT_DATA_BY_SEARCH: (searchKeyword: string, companyId?: number) => [
    "crm-contacts",
    searchKeyword,
    companyId
  ],
  CRM_COMPANIES: ["crm-companies"],
  CONTACT_LOOKUP: ["crm-contacts-lookup"],
  OWNER_LOOKUP: ["crm-owners-lookup"]
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
