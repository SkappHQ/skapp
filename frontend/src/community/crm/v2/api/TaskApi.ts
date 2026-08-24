import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import {
  crmTaskEndpoints,
  crmTaskEndpointsV2
} from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmTaskQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { UNPAGED_SIZE } from "~community/crm/v2/constants/taskConstants";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmRelatedTasksFilterRequest,
  CrmRelatedTasksRequest,
  CrmTaskCompletedFilterRequest,
  CrmTaskFilterRequest,
  CrmTaskListResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchOpenTasks = async (
  filter: CrmTaskFilterRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASKS, {
    params: { ...filter, isCompleted: false, size: UNPAGED_SIZE }
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
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASKS, {
    params: { ...filter, isCompleted: true }
  });
  return response?.data?.results?.[0];
};

export const useGetCompletedTasks = (
  filter: CrmTaskCompletedFilterRequest,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.COMPLETED_TASKS_BY_FILTER(filter),
    queryFn: ({ pageParam }) =>
      fetchCompletedTasks({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage: CrmTaskListResponse) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage.currentPage < lastPage.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    enabled
  });
};

const fetchTaskById = async (id: number): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASK_BY_ID(id));
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

const fetchRelatedTasks = async ({
  id,
  ...params
}: CrmRelatedTasksRequest): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(
    crmTaskEndpointsV2.GET_RELATED_TASKS(id),
    { params }
  );
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  filter: CrmRelatedTasksFilterRequest,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.RELATED_TASKS_BY_ID(filter.id, filter.size),
    queryFn: ({ pageParam }) =>
      fetchRelatedTasks({ id: filter.id, page: pageParam, size: filter.size }),
    getNextPageParam: (lastPage: CrmTaskListResponse) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage.currentPage < lastPage.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

const createTask = async (task: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.post(crmTaskEndpointsV2.CREATE_TASK, task);
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: (createdTask: CrmTaskEntity) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (createdTask) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdTask);
    },
    onError
  });
};

const updateTask = async ({
  id,
  ...task
}: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.patch(
    crmTaskEndpointsV2.UPDATE_TASK(id!),
    task
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess?: (updatedTask: CrmTaskEntity) => void,
  onError?: () => void
) => {
  return useMutation({
    mutationFn: updateTask,
    onSuccess,
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
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
