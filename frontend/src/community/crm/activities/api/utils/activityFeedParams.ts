import { getRequestTimezone } from "~community/common/utils/requestTimezoneUtils";
import { ACTIVITY_TABS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedFilters,
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

const getActivityTypeForTab = (tab: ActivityTab): ActivityType | null =>
  ACTIVITY_TABS.find((tabConfig) => tabConfig.id === tab)?.type ?? null;

export const buildActivityFeedParams = (
  query: ActivityFeedQuery
): ActivityFeedFilters => {
  const params: ActivityFeedFilters = {};
  const type = getActivityTypeForTab(query.tab);
  const search = query.search.trim();

  if (type) params.type = type;
  if (search) params.search = search;
  if (query.ownerId !== null) params.ownerId = query.ownerId;
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;

  return params;
};

export const resolveViewerTimezone = (requestTimezone?: string): string =>
  requestTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getViewerTimezone = (): string =>
  resolveViewerTimezone(getRequestTimezone());

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
