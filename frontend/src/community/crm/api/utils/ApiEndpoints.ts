import { moduleAPIPath } from "~community/common/constants/configs";

export const crmDealEndpoints = {
  GET_DEALS: `${moduleAPIPath.CRM}/deal`,
  CREATE_DEAL: `${moduleAPIPath.CRM}/deal`,
  DEAL_STAGES: `${moduleAPIPath.CRM}/deal/stage`
};

export const contactEndpoints = {
  GET_CONTACT_METRICS: `${moduleAPIPath.CRM}/contact/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`,
  CREATE_CONTACT: `${moduleAPIPath.CRM}/contact`,
  CONTACT_LOOKUP: `${moduleAPIPath.CRM}/contact/lookup`,
  OWNER_LOOKUP: `${moduleAPIPath.CRM}/contact/owners`
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  EDIT_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  DELETE_COMPANY: (id: number) => `${moduleAPIPath.CRM}/company/${id}`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};

export const boardEndpoints = {
  INIT_DATA: `${moduleAPIPath.CRM}/board/init-data`,
  DEALS_GROUPED: `${moduleAPIPath.CRM}/board/deals-grouped-by-stages`,
  REORDER_WITHIN_STAGE: `${moduleAPIPath.CRM}/board/deal-reorder-within-stage`,
  MOVE_BETWEEN_STAGES: `${moduleAPIPath.CRM}/board/deal-move-between-stages`,
};
