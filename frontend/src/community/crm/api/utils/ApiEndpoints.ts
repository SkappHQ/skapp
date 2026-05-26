import { moduleAPIPath } from "~community/common/constants/configs";
import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealEndpoints = {
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


export const companyEndpoints = {
  GET_COMPANY_METRICS: "/company/metrics",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
