import { moduleAPIPath } from "~community/common/constants/configs";
import { ActivityType } from "~community/crm/activities/types/activityTypes";

export const crmActivityEndpoints = {
  GET_ACTIVITY_FEED: `${moduleAPIPath.CRM}/activities`,
  GET_TEAM_MEMBERS: `${moduleAPIPath.CRM}/activities/team-members`
};

export const crmActivityListEndpoints: Record<ActivityType, string> = {
  [ActivityType.TASK]: `${moduleAPIPath.CRM}/activities/tasks`,
  [ActivityType.CALL]: `${moduleAPIPath.CRM}/activities/calls`,
  [ActivityType.MEETING]: `${moduleAPIPath.CRM}/activities/meetings`,
  [ActivityType.EMAIL]: `${moduleAPIPath.CRM}/activities/emails`
};
