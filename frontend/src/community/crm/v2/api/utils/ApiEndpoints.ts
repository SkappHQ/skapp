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

export const crmContactEndpoints = {
  GET_CONTACT_METRICS: (id: number) =>
    `${moduleAPIPath.CRM}/contact/${id}/metrics`,
  CONTACT_LOOKUP: `${moduleAPIPath.CRM}/contact/lookup`,
  OWNER_LOOKUP: `${moduleAPIPath.CRM}/contact/owners`
};

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`
};

export const crmTaskEndpoints = {
  GET_TASKS: `${moduleAPIPath.CRM}/task`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
};
