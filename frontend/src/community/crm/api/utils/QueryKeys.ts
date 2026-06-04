import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  GET_DEALS: (params: CrmDealFilterParams) => ["crm-deals", params]
};

export const contactQueryKeys = {
  GET_CONTACT_DATA: ["crm-contacts"],
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
  OWNER_LOOKUP: (searchKeyword: string) => ["crm-owner-lookup", searchKeyword],
  CHECK_CONTACT_EMAIL_EXISTS: ["check-contact-email-exists"]
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
