import { moduleAPIPath } from "~community/common/constants/configs";

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  EDIT_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};
