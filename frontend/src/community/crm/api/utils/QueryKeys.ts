import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const CRM_DEALS_KEY = "crm-deals";

export const crmDealQueryKeys = {
  GET_DEALS: (params: Omit<CrmDealFilterParams, "page">) => {
    const { size, sortOrder, sortKey, searchKeyword, stageId, priority } = params;
    return [
      CRM_DEALS_KEY,
      size,
      sortOrder,
      sortKey,
      searchKeyword,
      stageId,
      priority
    ].filter((v) => v !== undefined);
  },
  DEAL_STAGES: ["crm-deal-stages"]
};

export const crmContactQueryKeys = {
  ALL: ["crm-contacts"],
  LIST: (searchKeyword?: string) =>
    ["crm-contacts", "list", searchKeyword].filter((v) => v !== undefined)
};

export const crmCompanyQueryKeys = {
  ALL: ["crm-companies"],
  LIST: (searchKeyword?: string) =>
    ["crm-companies", "list", searchKeyword].filter((v) => v !== undefined)
};
