import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

const CRM_DEALS_KEY = "crm-deals";

export const crmDealQueryKeys = {
  ALL_DEALS: [CRM_DEALS_KEY],
  GET_DEALS: (params: CrmDealFilterParams) => {
    const { page, size, sortOrder, sortKey, searchKeyword, stageId, priorityId } = params;
    return [
      CRM_DEALS_KEY,
      page,
      size,
      sortOrder,
      sortKey,
      searchKeyword,
      stageId,
      priorityId
    ].filter((v) => v !== undefined);
  },
  DEAL_STAGES: ["crm-deal-stages"],
  PRIORITIES: ["crm-priorities"]
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
