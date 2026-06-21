import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`,
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage`,
  CREATE_DEAL_STAGE: `${moduleAPIPath.CRM}/deal/stage`,
  UPDATE_DEAL_STAGE: (id: number) => `${moduleAPIPath.CRM}/deal/stage/${id}`
};

export const contactEndpoints = {
  GET_CONTACT_METRICS: `${moduleAPIPath.CRM}/contact/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contact`,
  CONTACT_LOOKUP: `${moduleAPIPath.CRM}/contact/lookup`,
  OWNER_LOOKUP: `${moduleAPIPath.CRM}/contact/owners`,
  CONTACT_BY_ID: (id: number) => `${moduleAPIPath.CRM}/contact/${id}`
};

export const taskEndpoints = {
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  GET_OPEN_TASKS: `${moduleAPIPath.CRM}/task`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  GET_TASKS: `${moduleAPIPath.CRM}/task`,
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  EDIT_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  DELETE_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`,
  SEARCH_COMPANIES_BY_DOMAIN: `${moduleAPIPath.CRM}/company/search-by-domain`
};
