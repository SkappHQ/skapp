import { moduleAPIPath } from "~community/common/constants/configs";

<<<<<<< HEAD
export const taskEndpoints = {
  UPDATE_TASK_STATUS: (id: number) => `${moduleAPIPath.CRM}/task/${id}/status`
=======
export const contactEndpoints = {
  GET_CONTACT_METRICS: `${moduleAPIPath.CRM}/contact/metrics`,
  GET_COMPANIES: `${moduleAPIPath.CRM}/company/lookup`
>>>>>>> 13e6a58c26861c007988579f518eb320f78b9ff6
};

export const companyEndpoints = {
  GET_COMPANY_METRICS: `${moduleAPIPath.CRM}/company/metrics`,
  CREATE_COMPANY: `${moduleAPIPath.CRM}/company`,
  CHECK_COMPANY_NAME_EXISTS: (name: string) =>
    `${moduleAPIPath.CRM}/company/exists?name=${encodeURIComponent(name)}`
};
