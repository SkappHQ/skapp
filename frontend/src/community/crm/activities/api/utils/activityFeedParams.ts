import { getRequestTimezone } from "~community/common/utils/requestTimezoneUtils";
import { ACTIVITY_TABS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityListParams,
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

export const buildActivityListParams = (
  query: ActivityFeedQuery
): ActivityListParams => {
  const params: ActivityListParams = {};
  const searchKeyword = query.search.trim();

  if (searchKeyword) params.searchKeyword = searchKeyword;
  if (query.ownerId !== null) params.ownerId = query.ownerId;
  if (query.from) params.startDate = query.from;
  if (query.to) params.endDate = query.to;

  return params;
};

export const resolveViewerTimezone = (requestTimezone?: string): string =>
  requestTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getViewerTimezone = (): string =>
  resolveViewerTimezone(getRequestTimezone());

export const getNextActivityFeedPage = (
  lastPage: ActivityFeedResponse | null
): number | null =>
  lastPage?.byMonth?.hasMore ? lastPage.byMonth.page + 1 : null;

export const countActivityFeedRows = (
  pages: ActivityFeedResponse[]
): number => {
  const [firstPage] = pages;

  if (!firstPage) return 0;

  const datedRowCount =
    (firstPage.overdue?.length ?? 0) +
    (firstPage.today?.length ?? 0) +
    (firstPage.upcoming?.length ?? 0);

  return pages.reduce(
    (total, page) => total + (page?.byMonth?.items?.length ?? 0),
    datedRowCount
  );
};

export const shouldShowActivityControls = ({
  hasActiveFilters,
  isError,
  isLoading,
  isEmpty
}: {
  hasActiveFilters: boolean;
  isError: boolean;
  isLoading: boolean;
  isEmpty: boolean;
}): boolean => isLoading || hasActiveFilters || isError || !isEmpty;
