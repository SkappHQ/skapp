import { moduleAPIPath } from "~community/common/constants/configs";
import { CrmDealFilterParams } from "~community/crm/types/CommonTypes";

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

export const crmDealEndpoints = {
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEALS: (params: CrmDealFilterParams): string => {
    const { page, size, sortOrder, sortKey, searchKeyword, stageId, priority } = params;
    const urlParams = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    if (sortKey) urlParams.set("sortKey", sortKey);
    if (sortOrder) urlParams.set("sortOrder", sortOrder);
    if (searchKeyword) urlParams.set("searchKeyword", searchKeyword);
    if (stageId !== undefined) urlParams.set("stageId", String(stageId));
    if (priority !== undefined) urlParams.set("priority", priority);
    return `${moduleAPIPath.CRM}/deal?${urlParams.toString()}`;
  },
  GET_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stages`
};

export const crmContactEndpoints = {
  GET_CONTACTS: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/contact?${params.toString()}`;
  }
};

export const crmCompanyEndpoints = {
  GET_COMPANIES: (searchKeyword?: string): string => {
    const params = new URLSearchParams({ page: "0", size: "100" });
    if (searchKeyword) params.set("searchKeyword", searchKeyword);
    return `${moduleAPIPath.CRM}/company?${params.toString()}`;
  }
};
