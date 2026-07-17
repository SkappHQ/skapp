import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { taskEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import {
  CrmCompletedTaskResponseType,
  CrmTaskCategoryResponseType,
  CrmTaskCreatePayload,
  CrmTaskDetailType,
  CrmTaskResponseType,
  CrmTaskUpdatePayload,
  RelatedTasksPage,
  RelatedTasksParams
} from "~community/crm/types/CommonTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

import { contactQueryKeys, taskQueryKeys } from "./utils/QueryKeys";

export const useGetRelatedTasks = (
  params: RelatedTasksParams,
  enabled?: boolean
): UseInfiniteQueryResult<RelatedTasksPage> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: taskQueryKeys.RELATED_TASKS_BY_PARAMS(params),
    queryFn: async ({ pageParam = 0 }): Promise<RelatedTasksPage> => {
      const response = await authFetch.get(taskEndpoints.GET_RELATED_TASKS, {
        params: {
          page: pageParam,
          ...params
        }
      });
      return response?.data?.results?.[0];
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

const createTask = async (taskDetails: CrmTaskCreatePayload) => {
  const response = await authFetch.post(taskEndpoints.CREATE_TASK, taskDetails);
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: () => void,
  onError: () => void,
  contactId?: number | null
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    // Create can happen from the tasks page, a contact panel or a company panel,
    // each backed by a different query. A newly added row has no in-place flicker
    // to avoid, so invalidation is the simplest correct way to refresh them all.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });

      if (contactId) {
        queryClient.invalidateQueries({
          queryKey: contactQueryKeys.CONTACT_BY_ID(contactId)
        });
      }
      onSuccess();
    },
    onError
  });
};

interface OpenTasksParams {
  searchKeyword?: string;
  companyId?: number | null;
}

const fetchOpenTasks = async ({
  searchKeyword,
  companyId
}: OpenTasksParams): Promise<CrmTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_OPEN_TASKS, {
    params: {
      searchKeyword,
      ...(companyId != null && { companyId })
    }
  });
  return response?.data?.results?.[0];
};

export const useGetOpenTasks = (
  searchKeyword: string,
  enabled: boolean,
  companyId?: number | null
) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS_BY_SEARCH(searchKeyword, companyId),
    queryFn: () => fetchOpenTasks({ searchKeyword, companyId }),
    enabled
  });
};

interface TaskSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
  companyId?: number | null;
}

const fetchCompletedTasks = async ({
  page,
  size,
  searchKeyword,
  companyId
}: TaskSearchParams): Promise<CrmCompletedTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_COMPLETED_TASKS, {
    params: {
      page,
      size,
      searchKeyword,
      ...(companyId != null && { companyId })
    }
  });
  return response?.data?.results?.[0];
};

export const useGetCompletedTasks = (
  searchKeyword: string,
  size: number,
  enabled: boolean,
  companyId?: number | null
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: taskQueryKeys.GET_COMPLETED_TASKS_BY_SEARCH(
      searchKeyword,
      companyId
    ),
    queryFn: ({ pageParam }) =>
      fetchCompletedTasks({
        page: pageParam,
        size,
        searchKeyword,
        companyId
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled
  });
};

const deleteTask = async (id: number) => {
  await authFetch.delete(taskEndpoints.DELETE_TASK(id));
};

export const useDeleteTask = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const editTask = async ({ id, ...payload }: CrmTaskUpdatePayload) => {
  const response = await authFetch.patch(
    taskEndpoints.UPDATE_TASK(id),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess?: (task: CrmTaskDetailType) => void,
  onError?: () => void
) => {
  return useMutation({
    mutationFn: editTask,
    // No query invalidation: mark-done reflects the change optimistically and
    // edit merges the returned task into the store (updateTask), so lists update
    // in place without a refetch and the row never flickers.
    onSuccess: (task: CrmTaskDetailType) => {
      onSuccess?.(task);
    },
    onError
  });
};

export const useGetTaskTypes = () => {
  return useQuery({
    queryKey: taskQueryKeys.GET_TASK_TYPES,
    queryFn: async (): Promise<CrmTaskCategoryResponseType> => {
      const response = await authFetch.get(taskEndpoints.GET_TASK_TYPES);
      return response?.data?.results?.[0];
    }
  });
};

const fetchTaskById = async (id: number): Promise<CrmTaskDetailType> => {
  const response = await authFetch.get(taskEndpoints.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetTaskById = (id: number) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_TASK_BY_ID(id),
    queryFn: () => fetchTaskById(id)
  });
};
