import { moduleAPIPath } from "~community/common/constants/configs";

export const crmCompanyEndpoints = {
  GET_COMPANIES: `${moduleAPIPath.CRM}/company`,
  GET_COMPANY_BY_ID: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  GET_COMPANY_METRICS: (id: number) =>
    `${moduleAPIPath.CRM}/company/${id}/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  EDIT_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  DELETE_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  CHECK_COMPANY_NAME_EXISTS: `${moduleAPIPath.CRM}/company/exists`
};
