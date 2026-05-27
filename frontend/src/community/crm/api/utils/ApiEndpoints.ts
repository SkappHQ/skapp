import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: "/company/metrics",
  CREATE_COMPANY: "/company",
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `/company/exists?name=${encodeURIComponent(name)}`
};
