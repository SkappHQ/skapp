import { moduleAPIPath } from "~community/common/constants/configs";

export const crmTaskEndpoints = {
  GET_TASKS: `${moduleAPIPath.CRM}/task`,
  GET_TASK_BY_ID: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  GET_RELATED_TASKS: (id: number) => `${moduleAPIPath.CRM}/task/${id}/related`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  DELETE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
};

export const crmDealEndpoints = {
  GET_DEALS_BY_IDS: `${moduleAPIPath.CRM}/deal/batch`
};

export const crmCompanyEndpoints = {
  GET_COMPANIES_BY_IDS: `${moduleAPIPath.CRM}/company/batch`
};
