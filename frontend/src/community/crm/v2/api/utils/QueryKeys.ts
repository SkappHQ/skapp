import { CrmCompanyFilterRequest } from "~community/crm/v2/types/CrmTypes";

const CRM_COMPANIES = "crm-companies";

export const crmCompanyQueryKeys = {
  ALL: [CRM_COMPANIES],
  LIST: (params: CrmCompanyFilterRequest) => [CRM_COMPANIES, "list", params],
  DETAIL: (id: number) => [CRM_COMPANIES, "detail", id],
  METRICS: (id: number) => [CRM_COMPANIES, "metrics", id],
  NAME_EXISTS: (name: string) => [CRM_COMPANIES, "name-exists", name]
};
