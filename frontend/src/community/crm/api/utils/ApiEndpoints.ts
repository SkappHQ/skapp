import { moduleAPIPath } from "~community/common/constants/configs";

export const crmEndpoints = {
  GET_CONTACT_BY_ID: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}`,
  GET_CONTACT_METRICS: (id: number) =>
    `${moduleAPIPath.CRM}/contacts/${id}/metrics`,
  GET_DEALS_BY_CONTACT: (id: number) =>
    `${moduleAPIPath.CRM}/deals?contactId=${id}`,
  GET_TASKS_BY_CONTACT: (id: number) =>
    `${moduleAPIPath.CRM}/tasks?contactId=${id}`,
  CREATE_DEAL: `${moduleAPIPath.CRM}/deals`,
  UPDATE_TASK_COMPLETION: (id: number) => `${moduleAPIPath.CRM}/tasks/${id}`,
  UPDATE_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}`,
  DELETE_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}`
};
