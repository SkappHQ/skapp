import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  GET_DEALS: (params: CrmDealFilterParams) => [
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
