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
import { crmTaskEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmTaskQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmTaskCompletedFilterRequest,
  CrmTaskCompletedListResponse,
  CrmTaskFilterRequest,
  CrmTaskListResponse,
  CrmTaskRelatedListResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchOpenTasks = async (
  filter: CrmTaskFilterRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(crmTaskEndpoints.GET_TASKS, {
    params: { ...filter, isCompleted: false, size: -1 }
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
  const response = await authFetchV2.get(crmTaskEndpoints.GET_TASKS, {
    params: { ...filter, isCompleted: true }
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
  id: number,
  page: number,
  size: number
): Promise<CrmTaskRelatedListResponse> => {
  const response = await authFetchV2.get(
    crmTaskEndpoints.GET_RELATED_TASKS(id),
    { params: { page, size } }
  );
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  id: number,
  size: number,
  enabled: boolean
): UseInfiniteQueryResult<InfiniteData<CrmTaskRelatedListResponse>> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmTaskQueryKeys.RELATED_TASKS_BY_ID(id, size),
    queryFn: ({ pageParam }) => fetchRelatedTasks(id, pageParam, size),
    getNextPageParam: (lastPage: CrmTaskRelatedListResponse) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

const createTask = async (task: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.post(crmTaskEndpoints.CREATE_TASK, task);
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

  const response = await authFetchV2.patch(
    crmTaskEndpoints.UPDATE_TASK(id),
    task
  );
  return response?.data?.results?.[0];
};

/**
 * An edit changes one task that is already in the store, so the caller merges
 * the updated task the request returns rather than the lists being invalidated
 * and refetched.
 */
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
