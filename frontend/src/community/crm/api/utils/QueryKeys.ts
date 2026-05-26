import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  GET_DEAL_STAGES: ["crm-deal-stages"],
  GET_DEALS: (params: Omit<CrmDealFilterParams, "page">) => [
    "crm-deals",
    params.size,
    params.sortKey,
    params.sortOrder,
    params.searchKeyword,
    params.stageId,
    params.priority
  ].filter((v) => v !== undefined)
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
