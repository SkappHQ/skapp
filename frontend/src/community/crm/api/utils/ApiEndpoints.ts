import { moduleAPIPath } from "~community/common/constants/configs";

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`,
  SEARCH_COMPANIES_BY_DOMAIN: (domain: string) =>
    `${moduleAPIPath.CRM}/company/search-by-domain?domain=${encodeURIComponent(domain)}`
};
