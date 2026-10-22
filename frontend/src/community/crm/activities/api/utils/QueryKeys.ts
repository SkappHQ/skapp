import { ActivityFeedQuery } from "~community/crm/activities/api/utils/activityFeedParams";

const CRM_ACTIVITIES = "crm-activities";

export const crmActivityQueryKeys = {
  FEED_ROOT: [CRM_ACTIVITIES, "feed"],
  FEED: (query: ActivityFeedQuery) => [
    CRM_ACTIVITIES,
    "feed",
    query.tab,
    {
      search: query.search,
      ownerId: query.ownerId,
      from: query.from,
      to: query.to
    }
  ],
  TEAM_MEMBERS: [CRM_ACTIVITIES, "team-members"],
  TASK_DETAIL: (id: number) => [CRM_ACTIVITIES, "task", id]
};
