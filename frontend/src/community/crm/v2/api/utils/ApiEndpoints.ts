import { moduleAPIPath } from "~community/common/constants/configs";

export const crmTaskEndpoints = {
  GET_TASKS: `${moduleAPIPath.CRM}/task`,
  GET_TASK_BY_ID: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  GET_RELATED_TASKS: (id: number) => `${moduleAPIPath.CRM}/task/${id}/related`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  DELETE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
};

export const crmDealEndpointsV2 = {
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  GET_DEALS: `${moduleAPIPath.CRM}/deal`,
  EDIT_DEAL: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`,
  GET_DEAL_BY_ID: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`
};

export const crmDealEndpoints = {
  GET_DEALS_BY_IDS: `${moduleAPIPath.CRM}/deal/ids`,
  CHECK_DEAL_NAME_EXISTS: `${moduleAPIPath.CRM}/deal/exists`,
  DELETE_DEAL: (id: number) => `${moduleAPIPath.CRM}/deal/${id}`,
  DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage`,
  CREATE_DEAL_STAGE: `${moduleAPIPath.CRM}/deal/stage`,
  UPDATE_DEAL_STAGE: (id: number) => `${moduleAPIPath.CRM}/deal/stage/${id}`,
  REORDER_DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage/reorder`,
  DELETE_DEAL_STAGE: (id: number) => `${moduleAPIPath.CRM}/deal/stage/${id}`
};

export const crmCompanyEndpoints = {
  GET_COMPANIES_BY_IDS: `${moduleAPIPath.CRM}/company/ids`
};

export const crmLookupEndpoints = {
  CONTACT_LOOKUP: `${moduleAPIPath.CRM}/contact/lookup`,
  OWNER_LOOKUP: `${moduleAPIPath.CRM}/contact/owners`
};

export const crmBoardEndpoints = {
  GET_BOARD_INIT_DATA: `${moduleAPIPath.CRM}/board/init-data`,
  GET_DEALS_GROUPED_BY_STAGES: `${moduleAPIPath.CRM}/board/deals-grouped-by-stages`,
  REORDER_DEAL_WITHIN_STAGE: `${moduleAPIPath.CRM}/board/deal-reorder-within-stage`,
  MOVE_DEAL_BETWEEN_STAGES: `${moduleAPIPath.CRM}/board/deal-move-between-stages`
};
