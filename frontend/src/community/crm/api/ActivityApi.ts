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

import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  ActivityCallCreatePayload,
  ActivityCallResponse,
  ActivityEmailResponse,
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityListFilters,
  ActivityMeetingResponse,
  ActivityTaskResponse
} from "~community/crm/activities/types/activityTypes";
import { crmActivityEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/api/utils/QueryKeys";

const fetchActivityFeed = async (
  params: ActivityFeedFilters
): Promise<ActivityFeedResponse> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_ACTIVITY_FEED, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetActivityFeed = (
  params: ActivityFeedFilters,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<ActivityFeedResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmActivityQueryKeys.FEED(params),
    queryFn: ({ pageParam }) =>
      fetchActivityFeed({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.currentPage < lastPage.totalPages - 1
        ? lastPage.currentPage + 1
        : null,
    refetchOnWindowFocus: false
  });

const fetchActivityCalls = async (
  params: ActivityListFilters
): Promise<ActivityCallResponse[]> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_CALLS, {
    params
  });
  return response?.data?.results;
};

export const useGetActivityCalls = (
  params: ActivityListFilters,
  enabled: boolean
): UseQueryResult<ActivityCallResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.CALLS(params),
    queryFn: () => fetchActivityCalls(params),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchActivityEmails = async (
  params: ActivityListFilters
): Promise<ActivityEmailResponse[]> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_EMAILS, {
    params
  });
  return response?.data?.results;
};

export const useGetActivityEmails = (
  params: ActivityListFilters,
  enabled: boolean
): UseQueryResult<ActivityEmailResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.EMAILS(params),
    queryFn: () => fetchActivityEmails(params),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchActivityMeetings = async (
  params: ActivityListFilters
): Promise<ActivityMeetingResponse[]> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_MEETINGS, {
    params
  });
  return response?.data?.results;
};

export const useGetActivityMeetings = (
  params: ActivityListFilters,
  enabled: boolean
): UseQueryResult<ActivityMeetingResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.MEETINGS(params),
    queryFn: () => fetchActivityMeetings(params),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchActivityTasks = async (
  params: ActivityListFilters
): Promise<ActivityTaskResponse[]> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_TASKS, {
    params
  });
  return response?.data?.results;
};

export const useGetActivityTasks = (
  params: ActivityListFilters,
  enabled: boolean
): UseQueryResult<ActivityTaskResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.TASKS(params),
    queryFn: () => fetchActivityTasks(params),
    enabled,
    refetchOnWindowFocus: false
  });

const createCall = async (
  payload: ActivityCallCreatePayload
): Promise<void> => {
  await authFetch.post(crmActivityEndpoints.CREATE_CALL, payload);
};

export const useCreateCall = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityCallCreatePayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
