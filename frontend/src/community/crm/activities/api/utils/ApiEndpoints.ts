import { moduleAPIPath } from "~community/common/constants/configs";
import { ActivityType } from "~community/crm/activities/types/activityTypes";

export const crmActivityEndpoints = {
  GET_ACTIVITY_FEED: `${moduleAPIPath.CRM}/activities`
};

export const crmActivityListEndpoints: Record<ActivityType, string> = {
  [ActivityType.TASK]: `${moduleAPIPath.CRM}/activity/task`,
  [ActivityType.CALL]: `${moduleAPIPath.CRM}/activity/call`,
  [ActivityType.MEETING]: `${moduleAPIPath.CRM}/activity/meeting`,
  [ActivityType.EMAIL]: `${moduleAPIPath.CRM}/activity/email`
};
