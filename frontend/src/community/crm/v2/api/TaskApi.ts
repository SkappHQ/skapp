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
  const response = await authFetchV2.get(crmTaskEndpoints.GET_TASKS, {
    params: {
      searchKeyword: filter.searchKeyword,
      contactId: filter.contactId,
      dealId: filter.dealId,
      companyId: filter.companyId,
      isCompleted: false,
      size: UNPAGED_SIZE
    }
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
  const response = await authFetchV2.get(crmTaskEndpoints.GET_TASKS, {
    params: {
      page: filter.page,
      size: filter.size,
      searchKeyword: filter.searchKeyword,
      contactId: filter.contactId,
      dealId: filter.dealId,
      companyId: filter.companyId,
      isCompleted: true
    }
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
      fetchCompletedTasks({
        page: pageParam,
        size: filter.size,
        searchKeyword: filter.searchKeyword,
        contactId: filter.contactId,
        dealId: filter.dealId,
        companyId: filter.companyId
      }),
    getNextPageParam: (lastPage: CrmTaskListResponse) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled
  });
};

const fetchRelatedTasks = async (
  request: CrmRelatedTasksRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(
    crmTaskEndpoints.GET_RELATED_TASKS(request.id),
    { params: { page: request.page, size: request.size } }
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
