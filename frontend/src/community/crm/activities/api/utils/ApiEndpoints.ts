import { moduleAPIPath } from "~community/common/constants/configs";

export const crmActivityEndpoints = {
  GET_ACTIVITY_FEED: `${moduleAPIPath.CRM}/activities`,
  GET_TEAM_MEMBERS: `${moduleAPIPath.CRM}/activities/team-members`,
  GET_TASK_DETAIL: (id: number) =>
    `${moduleAPIPath.CRM}/activities/tasks/${id}`,
  UPDATE_TASK: (id: number) => `${moduleAPIPath.CRM}/activities/tasks/${id}`,
  COMPLETE_TASK: (id: number) =>
    `${moduleAPIPath.CRM}/activities/tasks/${id}/complete`
};
