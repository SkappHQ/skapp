import { getRequestTimezone } from "~community/common/utils/requestTimezoneUtils";
import {
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityListParams,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

const ACTIVITY_TAB_TYPES: Record<ActivityTab, ActivityType | null> = {
  [ActivityTab.ALL]: null,
  [ActivityTab.TASKS]: ActivityType.TASK,
  [ActivityTab.CALLS]: ActivityType.CALL,
  [ActivityTab.MEETINGS]: ActivityType.MEETING,
  [ActivityTab.EMAILS]: ActivityType.EMAIL
};

export interface ActivityFeedQuery {
  tab: ActivityTab;
  search: string;
  ownerId: number | null;
  from: string | null;
  to: string | null;
}

export const getActivityTypeForTab = (tab: ActivityTab): ActivityType | null =>
  ACTIVITY_TAB_TYPES[tab];

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
  if (query.from) params.fromDate = query.from;
  if (query.to) params.toDate = query.to;

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
  lastPage && lastPage.currentPage + 1 < lastPage.totalPages
    ? lastPage.currentPage + 1
    : null;

export const countActivityFeedRows = (
  pages: ActivityFeedResponse[]
): number => pages.reduce((total, page) => total + page.items.length, 0);

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
