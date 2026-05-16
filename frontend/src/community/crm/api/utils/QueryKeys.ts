import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmDealQueryKeys = {
  ALL_DEALS: ["crm-deals"],
  GET_DEALS: function (params: CrmDealFilterParams) {
    const { page, size, sortOrder, sortKey, searchKeyword, stageId, priorityId } = params;
    return [
      ...this.ALL_DEALS,
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
