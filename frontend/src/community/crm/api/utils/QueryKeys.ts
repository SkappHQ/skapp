import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const crmQueryKeys = {
  // Contacts
  CRM_CONTACTS: (params?: object) =>
    ["crm-contacts", params].filter((val) => val !== undefined),
  CRM_CONTACT_BY_ID: (id: number) => ["crm-contact", id],
  CRM_CONTACT_METRICS: (id: number) => ["crm-contact-metrics", id],
  CRM_CONTACT_DEALS: (contactId: number) => ["crm-contact-deals", contactId],
  CRM_CONTACT_TASKS: (contactId: number) => ["crm-contact-tasks", contactId],
  CRM_TASKS_BY_CONTACT: (contactId: number) => [
    "crm-tasks-by-contact",
    contactId
  ],

  // Owners & Companies
  CRM_OWNERS: (params?: object) =>
    ["crm-owners", params].filter((val) => val !== undefined),
  CRM_COMPANIES: (params?: object) =>
    ["crm-companies", params].filter((val) => val !== undefined)
};

export const CRM_DEALS_KEY = "crm-deals";

export const crmDealQueryKeys = {
  GET_DEALS: (params: Omit<CrmDealFilterParams, "page">) => {
    const { size, sortOrder, sortKey, searchKeyword, stageId, priority } =
      params;
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

export const taskQueryKeys = {
  ALL: ["crm-tasks"],
  GET_BY_CONTACT: (contactId: number) => ["crm-tasks", "contact", contactId]
};
