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
  ActivityMeetingCreatePayload,
  ActivityMeetingResponse,
  ActivityTaskResponse
} from "~community/crm/activities/types/activityTypes";
import { crmActivityEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CrmCallEntity,
  CrmMeetingEntity
} from "~community/crm/types/CrmCommonTypes";

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
const fetchCallById = async (id: number): Promise<CrmCallEntity> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_CALL_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetCallById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmCallEntity, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.CALL(id),
    queryFn: () => fetchCallById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchMeetingById = async (id: number): Promise<CrmMeetingEntity> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_MEETING_BY_ID(id)
  );
  return response?.data?.results?.[0];
};

export const useGetMeetingById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmMeetingEntity, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.MEETING(id),
    queryFn: () => fetchMeetingById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const createMeeting = async (
  payload: ActivityMeetingCreatePayload
): Promise<void> => {
  await authFetch.post(crmActivityEndpoints.CREATE_MEETING, payload);
};

export const useCreateMeeting = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityMeetingCreatePayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const deleteMeeting = async (id: number): Promise<void> => {
  await authFetch.delete(crmActivityEndpoints.DELETE_MEETING(id));
};

export const useDeleteMeeting = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
