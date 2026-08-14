import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmTaskEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmTaskQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmTaskCompletedFilterRequest,
  CrmTaskCompletedListResponse,
  CrmTaskFilterRequest,
  CrmTaskListResponse,
  CrmTaskRelatedFilterRequest,
  CrmTaskRelatedListResponse,
  CrmTaskTypeListResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchOpenTasks = async (
  filter: CrmTaskFilterRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetch.get(crmTaskEndpoints.GET_OPEN_TASKS, {
    params: filter
  });
  return response?.data?.results?.[0];
};

export const useGetOpenTasks = (
  filter: CrmTaskFilterRequest,
  enabled: boolean
): UseQueryResult<CrmTaskListResponse> => {
  return useQuery({
    queryKey: crmTaskQueryKeys.OPEN_TASKS_BY_FILTER(filter),
    queryFn: () => fetchOpenTasks(filter),
    enabled
  });
};

const fetchCompletedTasks = async (
  filter: CrmTaskCompletedFilterRequest
): Promise<CrmTaskCompletedListResponse> => {
  const response = await authFetch.get(crmTaskEndpoints.GET_COMPLETED_TASKS, {
    params: filter
  });
  return response?.data?.results?.[0];
};

export const useGetCompletedTasks = (
  filter: CrmTaskCompletedFilterRequest,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskCompletedListResponse>> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.COMPLETED_TASKS_BY_FILTER(filter),
    queryFn: ({ pageParam }) =>
      fetchCompletedTasks({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage: CrmTaskCompletedListResponse) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled
  });
};

const fetchRelatedTasks = async (
  filter: CrmTaskRelatedFilterRequest
): Promise<CrmTaskRelatedListResponse> => {
  const response = await authFetch.get(crmTaskEndpoints.GET_RELATED_TASKS, {
    params: filter
  });
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  filter: CrmTaskRelatedFilterRequest,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskRelatedListResponse>> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.RELATED_TASKS_BY_FILTER(filter),
    queryFn: ({ pageParam }) =>
      fetchRelatedTasks({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage: CrmTaskRelatedListResponse) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

const fetchTaskById = async (id: number): Promise<CrmTaskEntity> => {
  const response = await authFetch.get(crmTaskEndpoints.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetTaskById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmTaskEntity> => {
  return useQuery({
    queryKey: crmTaskQueryKeys.TASK_BY_ID(id),
    queryFn: () => fetchTaskById(id),
    enabled
  });
};

const fetchTaskTypes = async (): Promise<CrmTaskTypeListResponse> => {
  const response = await authFetch.get(crmTaskEndpoints.GET_TASK_TYPES);
  return response?.data?.results?.[0];
};

export const useGetTaskTypes = (
  enabled: boolean
): UseQueryResult<CrmTaskTypeListResponse> => {
  return useQuery({
    queryKey: crmTaskQueryKeys.TASK_TYPES,
    queryFn: fetchTaskTypes,
    enabled
  });
};

const createTask = async (task: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetch.post(crmTaskEndpoints.CREATE_TASK, task);
  return response?.data?.results?.[0];
};

export const useCreateTask = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.RELATED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const updateTask = async ({
  id,
  ...task
}: CrmTaskEntity): Promise<CrmTaskEntity> => {
  if (id === undefined) {
    throw new Error("A task id is required to update a task");
  }

  const response = await authFetch.patch(
    crmTaskEndpoints.UPDATE_TASK(id),
    task
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (onSuccess?: () => void, onError?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.RELATED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.TASK
      });
      onSuccess?.();
    },
    onError
  });
};

const deleteTask = async (id: number): Promise<void> => {
  await authFetch.delete(crmTaskEndpoints.DELETE_TASK(id));
};

export const useDeleteTask = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmTaskQueryKeys.RELATED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
