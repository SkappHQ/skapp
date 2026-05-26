import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

export const CRM_DEALS_KEY = "crm-deals";
export const CRM_CONTACTS_KEY = "crm-contacts";
export const CRM_COMPANIES_KEY = "crm-companies";

export const crmQueryKeys = {
  ALL: (entity: string) => [entity],
  LIST: (entity: string, searchKeyword?: string) => [entity, "list", searchKeyword].filter((v) => v !== undefined),
  DETAILS: (entity: string, id: string | number) => [entity, "details", id],
  FILTERED: (entity: string, params: Record<string, any>) => [entity, ...Object.values(params).filter((v) => v !== undefined)],
  STAGES: (entity: string) => [entity, "stages"]
};
