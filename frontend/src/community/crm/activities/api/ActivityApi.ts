import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  crmActivityEndpoints,
  crmActivityListEndpoints
} from "~community/crm/activities/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  ActivityFeedQuery,
  buildActivityFeedParams,
  buildActivityListParams,
  getActivityTypeForTab,
  getNextActivityFeedPage,
  getViewerTimezone
} from "~community/crm/activities/api/utils/activityFeedParams";
import {
  ActivityFeedResponse,
  ActivityListItem
} from "~community/crm/activities/types/activityTypes";

const fetchActivityFeed = async (
  query: ActivityFeedQuery,
  page: number,
  signal?: AbortSignal
): Promise<ActivityFeedResponse> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_ACTIVITY_FEED, {
    params: buildActivityFeedParams(query, page),
    headers: { [TIMEZONE_HEADER]: getViewerTimezone() },
    signal
  });
  return response?.data?.results?.[0];
};

export const useGetActivityFeedInfinite = (
  query: ActivityFeedQuery,
  enabled: boolean = true
): UseInfiniteQueryResult<
  InfiniteData<ActivityFeedResponse, number>,
  AxiosError
> =>
  useInfiniteQuery({
    queryKey: crmActivityQueryKeys.FEED(query),
    queryFn: ({ pageParam, signal }) =>
      fetchActivityFeed(query, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextActivityFeedPage(lastPage),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchActivityList = async (
  query: ActivityFeedQuery,
  signal?: AbortSignal
): Promise<ActivityListItem[]> => {
  const type = getActivityTypeForTab(query.tab);

  if (!type) return [];

  const response = await authFetch.get(crmActivityListEndpoints[type], {
    params: buildActivityListParams(query),
    headers: { [TIMEZONE_HEADER]: getViewerTimezone() },
    signal
  });
  return response?.data?.results ?? [];
};

export const useGetActivityList = (
  query: ActivityFeedQuery,
  enabled: boolean = true
): UseQueryResult<ActivityListItem[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.LIST(query),
    queryFn: ({ signal }) => fetchActivityList(query, signal),
    enabled: enabled && getActivityTypeForTab(query.tab) !== null,
    refetchOnWindowFocus: false
  });
