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
  ActivityCallEditPayload,
  ActivityCallResponse,
  ActivityEmailCreatePayload,
  ActivityEmailResponse,
  ActivityFeedFilters,
  ActivityFeedResponse,
  ActivityListFilters,
  ActivityMeetingCreatePayload,
  ActivityMeetingEditPayload,
  ActivityMeetingResponse,
  ActivityTaskCreatePayload,
  ActivityTaskEditPayload,
  ActivityTaskResponse,
  RecordActivityFilters
} from "~community/crm/activities/types/activityTypes";
import { crmActivityEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CrmActivityEmailEntity,
  CrmActivityTaskEntity,
  CrmCallEntity,
  CrmMeetingEntity,
  CrmTaskCompletionPayload
} from "~community/crm/types/CrmCommonTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchActivityFeed = async (
  params: ActivityFeedFilters | RecordActivityFilters
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

export const useGetRecordActivities = (
  params: RecordActivityFilters,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<ActivityFeedResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmActivityQueryKeys.RECORD(params),
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

const createEmail = async (
  payload: ActivityEmailCreatePayload
): Promise<void> => {
  await authFetch.post(crmActivityEndpoints.CREATE_EMAIL, payload);
};

export const useCreateEmail = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityEmailCreatePayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

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

const updateTaskCompletion = async ({
  id,
  isCompleted
}: CrmTaskCompletionPayload): Promise<void> => {
  await authFetch.patch(crmActivityEndpoints.EDIT_TASK(id), { isCompleted });
};

export const useUpdateTaskCompletion = (
  onError: (payload: CrmTaskCompletionPayload) => void
): UseMutationResult<void, ErrorResponse, CrmTaskCompletionPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskCompletion,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL }),
    onError: (_error, payload) => onError(payload)
  });
};

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
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
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
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const createTask = async (
  payload: ActivityTaskCreatePayload
): Promise<void> => {
  await authFetch.post(crmActivityEndpoints.CREATE_TASK, payload);
};

export const useCreateTask = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityTaskCreatePayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const fetchTaskById = async (id: number): Promise<CrmActivityTaskEntity> => {
  const response = await authFetch.get(crmActivityEndpoints.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetActivityTaskById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmActivityTaskEntity, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.TASK(id),
    queryFn: () => fetchTaskById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const updateCall = async ({
  id,
  ...payload
}: ActivityCallEditPayload): Promise<void> => {
  await authFetch.patch(crmActivityEndpoints.EDIT_CALL(id), payload);
};

export const useUpdateCall = (
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityCallEditPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCall,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL }),
    onError
  });
};

const updateMeeting = async ({
  id,
  ...payload
}: ActivityMeetingEditPayload): Promise<void> => {
  await authFetch.patch(crmActivityEndpoints.EDIT_MEETING(id), payload);
};

export const useUpdateMeeting = (
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityMeetingEditPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMeeting,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL }),
    onError
  });
};

const updateActivityTask = async ({
  id,
  ...payload
}: ActivityTaskEditPayload): Promise<void> => {
  await authFetch.patch(crmActivityEndpoints.EDIT_TASK(id), payload);
};

export const useUpdateActivityTask = (
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, ActivityTaskEditPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivityTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL }),
    onError
  });
};

const deleteCall = async (id: number): Promise<void> => {
  await authFetch.delete(crmActivityEndpoints.DELETE_CALL(id));
};

export const useDeleteCall = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCall,
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

const deleteActivityTask = async (id: number): Promise<void> => {
  await authFetch.delete(crmActivityEndpoints.DELETE_TASK(id));
};

export const useDeleteActivityTask = (
  onSuccess: () => void,
  onError: (error: ErrorResponse) => void
): UseMutationResult<void, ErrorResponse, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivityTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmActivityQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const fetchRelatedCalls = async (
  id: number
): Promise<ActivityCallResponse[]> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_RELATED_CALLS(id)
  );
  return response?.data?.results;
};

export const useGetRelatedCalls = (
  id: number,
  enabled: boolean
): UseQueryResult<ActivityCallResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.RELATED_CALLS(id),
    queryFn: () => fetchRelatedCalls(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchRelatedMeetings = async (
  id: number
): Promise<ActivityMeetingResponse[]> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_RELATED_MEETINGS(id)
  );
  return response?.data?.results;
};

export const useGetRelatedMeetings = (
  id: number,
  enabled: boolean
): UseQueryResult<ActivityMeetingResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.RELATED_MEETINGS(id),
    queryFn: () => fetchRelatedMeetings(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchRelatedActivityTasks = async (
  id: number
): Promise<ActivityTaskResponse[]> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_RELATED_TASKS(id)
  );
  return response?.data?.results;
};

export const useGetRelatedActivityTasks = (
  id: number,
  enabled: boolean
): UseQueryResult<ActivityTaskResponse[], AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.RELATED_TASKS(id),
    queryFn: () => fetchRelatedActivityTasks(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchEmailById = async (id: number): Promise<CrmActivityEmailEntity> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_EMAIL_BY_ID(id)
  );
  return response?.data?.results?.[0];
};

export const useGetEmailById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmActivityEmailEntity, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.EMAIL(id),
    queryFn: () => fetchEmailById(id),
    enabled,
    refetchOnWindowFocus: false
  });
