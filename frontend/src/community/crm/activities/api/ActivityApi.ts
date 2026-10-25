import {
  InfiniteData,
  UseInfiniteQueryResult,
  useInfiniteQuery
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import { crmActivityEndpoints } from "~community/crm/activities/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  ActivityFeedQuery,
  buildActivityFeedParams,
  getNextActivityFeedPage,
  getViewerTimezone
} from "~community/crm/activities/api/utils/activityFeedParams";
import { ActivityFeedResponse } from "~community/crm/activities/types/activityTypes";

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
