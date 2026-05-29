import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`,
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stages`
};

export const crmContactEndpoints = {
  GET_CONTACTS: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/contact?${params.toString()}`;
  },
  GET_OWNERS: (params?: {
    page?: number;
    size?: number;
    searchKeyword?: string;
  }): string => {
    const urlParams = new URLSearchParams({
      page: String(params?.page ?? 0),
      size: String(params?.size ?? 10)
    });
    if (params?.searchKeyword) urlParams.set("searchKeyword", params.searchKeyword);
    return `${moduleAPIPath.CRM}/contact/owners?${urlParams.toString()}`;
  }
};

export const crmCompanyEndpoints = {
  GET_COMPANIES: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/company?${params.toString()}`;
  },
  GET_COMPANY_LOOKUP: (params?: {
    page?: number;
    size?: number;
    searchKeyword?: string;
  }): string => {
    const urlParams = new URLSearchParams({
      page: String(params?.page ?? 0),
      size: String(params?.size ?? 10)
    });
    if (params?.searchKeyword) urlParams.set("searchKeyword", params.searchKeyword);
    return `${moduleAPIPath.CRM}/company/lookup?${urlParams.toString()}`;
  }
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};
