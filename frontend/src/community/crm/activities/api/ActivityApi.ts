import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import { crmActivityEndpoints } from "~community/crm/activities/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import { markFeedCacheStale } from "~community/crm/activities/api/utils/activityFeedCache";
import {
  ActivityFeedQuery,
  buildActivityFeedParams,
  getNextActivityFeedPage,
  getViewerTimezone
} from "~community/crm/activities/api/utils/activityFeedParams";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";

export interface CompleteActivityTaskRequest {
  id: number;
  isCompleted: boolean;
}

export const fetchActivityFeed = async (
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

export const fetchActivityTeamMembers = async (): Promise<
  ActivityTeamMember[]
> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_TEAM_MEMBERS);
  return response?.data?.results ?? [];
};

export const useGetActivityTeamMembers = (
  isManager: boolean
): UseQueryResult<ActivityTeamMember[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.TEAM_MEMBERS,
    queryFn: fetchActivityTeamMembers,
    enabled: isManager,
    refetchOnWindowFocus: false
  });

const completeActivityTask = async ({
  id,
  isCompleted
}: CompleteActivityTaskRequest): Promise<ActivityRow> => {
  const response = await authFetch.patch(
    crmActivityEndpoints.COMPLETE_TASK(id),
    { isCompleted },
    { headers: { [TIMEZONE_HEADER]: getViewerTimezone() } }
  );
  return response?.data?.results?.[0];
};

export const useCompleteActivityTask = (
  onSuccess?: (
    updatedRow: ActivityRow,
    request: CompleteActivityTaskRequest
  ) => void,
  onError?: (error: AxiosError, request: CompleteActivityTaskRequest) => void
): UseMutationResult<ActivityRow, AxiosError, CompleteActivityTaskRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeActivityTask,
    onSuccess: (updatedRow, request) => {
      onSuccess?.(updatedRow, request);
      void markFeedCacheStale(queryClient);
    },
    onError: (error, request) => {
      onError?.(error, request);
    }
  });
};
