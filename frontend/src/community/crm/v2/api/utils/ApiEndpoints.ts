import { moduleAPIPath } from "~community/common/constants/configs";

export const crmTaskEndpoints = {
  GET_OPEN_TASKS: `${moduleAPIPath.CRM}/task`,
  GET_COMPLETED_TASKS: `${moduleAPIPath.CRM}/task/completed`,
  GET_RELATED_TASKS: `${moduleAPIPath.CRM}/task/related`,
  GET_TASK_TYPES: `${moduleAPIPath.CRM}/task/type`,
  GET_TASK_BY_ID: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  CREATE_TASK: `${moduleAPIPath.CRM}/task`,
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`,
  DELETE_TASK: (id: number) => `${moduleAPIPath.CRM}/task/${id}`
};
