import { moduleAPIPath } from "~community/common/constants/configs";

export const taskEndpoints = {
  GET_TASK_TYPES: `${moduleAPIPath.CRM}/task/type`,
  UPDATE_TASK_STATUS: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
};

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
