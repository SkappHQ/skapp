import { ActivityFeedQuery } from "~community/crm/activities/api/utils/activityFeedParams";

const CRM_ACTIVITIES = "crm-activities";

const toFilterKey = (query: ActivityFeedQuery) => ({
  search: query.search,
  ownerId: query.ownerId,
  from: query.from,
  to: query.to
});

export const crmActivityQueryKeys = {
  FEED: (query: ActivityFeedQuery) => [
    CRM_ACTIVITIES,
    "feed",
    query.tab,
    toFilterKey(query)
  ],
  LIST: (query: ActivityFeedQuery) => [
    CRM_ACTIVITIES,
    "list",
    query.tab,
    toFilterKey(query)
  ]
};
