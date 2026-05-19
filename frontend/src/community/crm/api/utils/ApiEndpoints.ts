import { moduleAPIPath } from "~community/common/constants/configs";
import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealEndpoints = {
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEALS: (params: CrmDealFilterParams): string => {
    const { page, size, sortOrder, sortKey, searchKeyword, stageId, priorityId } = params;
    const urlParams = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    if (sortKey) urlParams.set("sortKey", sortKey);
    if (sortOrder) urlParams.set("sortOrder", sortOrder);
    if (searchKeyword) urlParams.set("searchKeyword", searchKeyword);
    if (stageId !== undefined) urlParams.set("stageId", String(stageId));
    if (priorityId !== undefined) urlParams.set("priorityId", String(priorityId));
    return `${moduleAPIPath.CRM}/deal?${urlParams.toString()}`;
  },
  GET_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stages`,
  GET_PRIORITIES: `${moduleAPIPath.CRM}/priorities`
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
