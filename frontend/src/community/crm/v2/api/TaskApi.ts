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
import {
  crmCompanyQueryKeys,
  crmContactQueryKeys,
  crmTaskQueryKeys
} from "~community/crm/v2/api/utils/QueryKeys";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmRelatedTasksFilterRequest,
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

export const useGetTasksInfinite = (
  params: CrmTaskFilterRequest
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmTaskQueryKeys.LIST(params),
    queryFn: ({ pageParam }) => fetchTasks({ ...params, page: pageParam }),
    initialPageParam: 0,
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
    refetchOnWindowFocus: false
  });

export const useGetTasks = (
  params: CrmTaskFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmTaskListResponse, AxiosError> =>
  useQuery({
    queryKey: crmTaskQueryKeys.LIST(params),
    queryFn: () => fetchTasks(params),
    enabled,
    refetchOnWindowFocus: false
  });

export const useGetCompletedTasks = (
  params: CrmTaskFilterRequest,
  enabled?: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmTaskQueryKeys.COMPLETED_LIST(params),
    queryFn: ({ pageParam }) => fetchTasks({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 0,
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
    refetchOnWindowFocus: false
  });

const fetchTaskById = async (id: number): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.get(crmTaskEndpointsV2.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetTaskById = (
  id: number,
  enabled?: boolean
): UseQueryResult<CrmTaskEntity, AxiosError> =>
  useQuery({
    queryKey: crmTaskQueryKeys.DETAIL(id),
    queryFn: () => fetchTaskById(id),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchRelatedTasks = async (
  params: CrmRelatedTasksFilterRequest
): Promise<CrmTaskListResponse> => {
  const { id, ...query } = params;
  const response = await authFetchV2.get(
    crmTaskEndpointsV2.GET_RELATED_TASKS(id),
    { params: query }
  );
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  params: CrmRelatedTasksFilterRequest,
  enabled?: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmTaskQueryKeys.RELATED(params),
    queryFn: ({ pageParam }) =>
      fetchRelatedTasks({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 0,
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
    refetchOnWindowFocus: false
  });

const createTask = async (payload: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.post(
    crmTaskEndpointsV2.CREATE_TASK,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: (task: CrmTaskEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskEntity> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (createdTask) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      queryClient.invalidateQueries({ queryKey: crmTaskQueryKeys.LISTS });
      if (createdTask.companyId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmCompanyQueryKeys.METRICS(createdTask.companyId)
        });
      }
      if (createdTask.contactId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.METRICS(createdTask.contactId)
        });
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.LISTS
        });
      }
      onSuccess(createdTask);
    },
    onError
  });
};

const updateTask = async ({
  id,
  task
}: CrmTaskUpdateRequest): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.patch(
    crmTaskEndpointsV2.UPDATE_TASK(id),
    task
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess?: (task: CrmTaskEntity) => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskUpdateRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: crmTaskQueryKeys.LISTS });
      if (updatedTask.companyId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmCompanyQueryKeys.METRICS(updatedTask.companyId)
        });
      }
      if (updatedTask.contactId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.METRICS(updatedTask.contactId)
        });
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.LISTS
        });
      }
      onSuccess?.(updatedTask);
    }
  });
};

const deleteTask = async (id: number): Promise<void> => {
  await authFetch.delete(crmTaskEndpoints.DELETE_TASK(id));
};

export const useDeleteTask = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      queryClient.invalidateQueries({ queryKey: crmTaskQueryKeys.LISTS });
      onSuccess();
    },
    onError
  });
};
