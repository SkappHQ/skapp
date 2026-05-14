import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEALS: (
    page: number,
    size: number,
    sortOrder: string,
    sortKey: string,
    searchKeyword?: string,
    stageId?: number,
    priorityId?: number
  ): string => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortOrder,
      sortKey
    });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    if (stageId !== undefined) params.set("stageId", String(stageId));
    if (priorityId !== undefined) params.set("priorityId", String(priorityId));
    return `${moduleAPIPath.CRM}/deal?${params.toString()}`;
  },
  GET_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage`,
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
