import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`,
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage`,
  GET_DEAL_BY_ID: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`,
  EDIT_DEAL: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`,
  DELETE_DEAL: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`,
  CREATE_DEAL_STAGE: `${moduleAPIPath.CRM}/deal/stage`,
  UPDATE_DEAL_STAGE: (id: number) => `${moduleAPIPath.CRM}/deal/stage/${id}`,
  REORDER_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage/reorder`,
  DELETE_DEAL_STAGE: (id: number) => `${moduleAPIPath.CRM}/deal/stage/${id}`,
  CHECK_DEAL_NAME_EXISTS: `${moduleAPIPath.CRM}/deal/exists`
};

export const crmBoardEndpoints = {
  GET_BOARD_INIT_DATA: `${moduleAPIPath.CRM}/board/init-data`,
  GET_DEALS_GROUPED_BY_STAGES: `${moduleAPIPath.CRM}/board/deals-grouped-by-stages`,
  REORDER_DEAL_WITHIN_STAGE: `${moduleAPIPath.CRM}/board/deal-reorder-within-stage`,
  MOVE_DEAL_BETWEEN_STAGES: `${moduleAPIPath.CRM}/board/deal-move-between-stages`
};

export const contactEndpoints = {
  GET_CONTACT_METRICS: `${moduleAPIPath.CRM}/contact/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contact`,
  EDIT_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contact/${id}`,
  CONTACT_LOOKUP: `${moduleAPIPath.CRM}/contact/lookup`,
  OWNER_LOOKUP: `${moduleAPIPath.CRM}/contact/owners`,
  CONTACT_BY_ID: (id: number) => `${moduleAPIPath.CRM}/contact/${id}`,
  DELETE_CONTACT: (id: number) => `${moduleAPIPath.CRM}/contact/${id}`
};

export const taskEndpoints = {
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  GET_OPEN_TASKS: `${moduleAPIPath.CRM}/task`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  GET_TASKS: `${moduleAPIPath.CRM}/task`,
  GET_COMPLETED_TASKS: `${moduleAPIPath.CRM}/task/completed`,
  GET_RELATED_TASKS: `${moduleAPIPath.CRM}/task/related`,
  DELETE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  GET_TASK_TYPES: `${moduleAPIPath.CRM}/task/type`,
  GET_TASK_BY_ID: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
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
