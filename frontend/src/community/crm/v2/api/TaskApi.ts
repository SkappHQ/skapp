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

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import {
  crmTaskEndpoints,
  crmTaskEndpointsV2
} from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmTaskQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmRelatedTasksFilter,
  CrmTaskFilterRequest,
  CrmTaskListResponse,
  CrmTaskUpdateRequest
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchTasks = async (
  params: CrmTaskFilterRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASKS, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetTasks = (
  filter: CrmTaskFilterRequest,
  enabled: boolean
): UseQueryResult<CrmTaskListResponse> =>
  useQuery({
    queryKey: crmTaskQueryKeys.TASKS(filter),
    queryFn: () => fetchTasks(filter),
    enabled,
    refetchOnWindowFocus: false
  });

export const useGetCompletedTasks = (
  filter: CrmTaskFilterRequest,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>> =>
  useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.COMPLETED_TASKS(filter),
    queryFn: ({ pageParam = 0 }) => fetchTasks({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage) => {
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

const fetchTaskById = async (id: number): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetTaskById = (
  id: number,
  enabled: boolean
): UseQueryResult<CrmTaskEntity> =>
  useQuery({
    queryKey: crmTaskQueryKeys.TASK_BY_ID(id),
    queryFn: () => fetchTaskById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchRelatedTasks = async (
  id: number,
  filter: CrmRelatedTasksFilter
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(
    crmTaskEndpointsV2.GET_RELATED_TASKS(id),
    { params: filter }
  );
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  id: number,
  filter: CrmRelatedTasksFilter,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>> =>
  useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.RELATED_TASKS(id, filter),
    queryFn: ({ pageParam = 0 }) =>
      fetchRelatedTasks(id, { size: filter.size, page: pageParam }),
    getNextPageParam: (lastPage) => {
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

const createTask = async (task: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.post(crmTaskEndpointsV2.CREATE_TASK, task);
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: (createdTask: CrmTaskEntity) => void,
  onError: () => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskEntity> => {
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

const updateTask = async (
  params: CrmTaskUpdateRequest
): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.patch(
    crmTaskEndpointsV2.UPDATE_TASK(params.id),
    params.task
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess?: (updatedTask: CrmTaskEntity) => void,
  onError?: () => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskUpdateRequest> =>
  useMutation({
    mutationFn: updateTask,
    onSuccess,
    onError
  });

const deleteTask = async (id: number): Promise<void> => {
  await authFetch.delete(crmTaskEndpoints.DELETE_TASK(id));
};

export const useDeleteTask = (
  onSuccess: () => void,
  onError: () => void
): UseMutationResult<void, AxiosError, number> => {
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
