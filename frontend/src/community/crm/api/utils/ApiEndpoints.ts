import { moduleAPIPath } from "~community/common/constants/configs";

export const taskEndpoints = {
  UPDATE_TASK_STATUS: (id: number) => `${moduleAPIPath.CRM}/task/${id}/status`
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};
