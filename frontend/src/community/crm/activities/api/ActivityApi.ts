import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import { crmActivityEndpoints } from "~community/crm/activities/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  ActivityFeedQuery,
  buildActivityFeedParams,
  getViewerTimezone
} from "~community/crm/activities/api/utils/activityFeedParams";
import { ActivityFeedResponse } from "~community/crm/activities/types/activityTypes";

const fetchActivityFeed = async (
  query: ActivityFeedQuery,
  signal?: AbortSignal
): Promise<ActivityFeedResponse> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_ACTIVITY_FEED, {
    params: buildActivityFeedParams(query),
    headers: { [TIMEZONE_HEADER]: getViewerTimezone() },
    signal
  });
  return response?.data?.results ?? [];
};

export const useGetActivityFeed = (
  query: ActivityFeedQuery,
  enabled: boolean = true
): UseQueryResult<ActivityFeedResponse, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.FEED(query),
    queryFn: ({ signal }) => fetchActivityFeed(query, signal),
    enabled,
    refetchOnWindowFocus: false
  });
