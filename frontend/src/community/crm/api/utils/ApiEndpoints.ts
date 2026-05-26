import { moduleAPIPath } from "~community/common/constants/configs";
import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealEndpoints = {
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEALS: (params: CrmDealFilterParams): string => {
    const { page, size, sortOrder, sortKey, searchKeyword, stageId, priority } = params;
    const urlParams = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    if (sortKey) urlParams.set("sortKey", sortKey);
    if (sortOrder) urlParams.set("sortOrder", sortOrder);
    if (searchKeyword) urlParams.set("searchKeyword", searchKeyword);
    if (stageId !== undefined) urlParams.set("stageId", String(stageId));
    if (priority !== undefined) urlParams.set("priority", priority);
    return `${moduleAPIPath.CRM}/deal?${urlParams.toString()}`;
  },
  GET_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stages`
};

export const crmContactEndpoints = {
  GET_CONTACTS: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/contact?${params.toString()}`;
  }
};

export const crmCompanyEndpoints = {
  GET_COMPANIES: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/company?${params.toString()}`;
  }
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: "/company/metrics",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
