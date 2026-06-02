import { moduleAPIPath } from "~community/common/constants/configs";

export const contactEndpoints = {
  GET_CONTACT_METRICS: `${moduleAPIPath.CRM}/contact/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};

export const crmEndpoints = {
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contact`,
  GET_OWNERS: `${moduleAPIPath.CRM}/contact/owners`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`
};
