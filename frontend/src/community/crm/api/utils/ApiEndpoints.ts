import { moduleAPIPath } from "~community/common/constants/configs";

export const crmEndpoints = {
  // Contacts
  GET_CONTACTS: `${moduleAPIPath.CRM}/contacts`,
  GET_CONTACT_BY_ID: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}`,
  GET_CONTACT_METRICS: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}/metrics`,
  GET_CONTACT_DEALS: (contactId: number) => `${moduleAPIPath.CRM}/contacts/${contactId}/deals`,
  GET_CONTACT_TASKS: (contactId: number) => `${moduleAPIPath.CRM}/contacts/${contactId}/tasks`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contacts`,
  UPDATE_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contacts/${id}`,
  DELETE_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contacts/delete/${id}`,

  // Tasks
  GET_TASKS_BY_CONTACT: (contactId: number) => `${moduleAPIPath.CRM}/contacts/${contactId}/tasks`,
  UPDATE_TASK_COMPLETION: (taskId: number) => `${moduleAPIPath.CRM}/tasks/${taskId}/completion`,

  // Owners & Companies
  GET_OWNERS: `${moduleAPIPath.CRM}/owners`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/companies/lookup`
};
