import { getRequestTimezone } from "~community/common/utils/requestTimezoneUtils";
import { ACTIVITY_TABS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export interface ActivityFeedQuery {
  tab: ActivityTab;
  search: string;
  ownerId: number | null;
  from: string | null;
  to: string | null;
}

export const getActivityTypeForTab = (tab: ActivityTab): ActivityType | null =>
  ACTIVITY_TABS.find((tabConfig) => tabConfig.id === tab)?.type ?? null;

export const buildActivityFeedParams = (
  query: ActivityFeedQuery,
  page: number
): ActivityFeedFilters => {
  const params: ActivityFeedFilters = { page };
  const type = getActivityTypeForTab(query.tab);
  const search = query.search.trim();

  if (type) params.type = type;
  if (search) params.search = search;
  if (query.ownerId !== null) params.ownerId = query.ownerId;
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;

  return params;
};

export const getViewerTimezone = (): string =>
  getRequestTimezone() ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getNextActivityFeedPage = (
  lastPage: ActivityFeedResponse | null
): number | null =>
  lastPage?.byMonth?.hasMore ? lastPage.byMonth.page + 1 : null;

export const isActivityFeedEmpty = (pages: ActivityFeedResponse[]): boolean => {
  const [firstPage] = pages;

  if (!firstPage) return true;

  const hasDatedRows =
    (firstPage.overdue?.length ?? 0) > 0 ||
    (firstPage.today?.length ?? 0) > 0 ||
    (firstPage.upcoming?.length ?? 0) > 0;

  return (
    !hasDatedRows &&
    pages.every((page) => (page?.byMonth?.items?.length ?? 0) === 0)
  );
};
