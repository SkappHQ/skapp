import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { taskEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import {
  CrmCompletedTaskResponseType,
  CrmTaskCreatePayload,
  CrmTaskResponseType,
  RelatedTasksParams,
  UpdateTaskStatusPayload
} from "~community/crm/types/CommonTypes";

import { contactQueryKeys, taskQueryKeys } from "./utils/QueryKeys";



const fetchRelatedOpenTasks = async (
  params: RelatedTasksParams
): Promise<CrmTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_OPEN_TASKS, {
    params: {
      contactId: params.contactId,
      dealId: params.dealId,
      companyId: params.companyId
    }
  });
  return response?.data?.results?.[0];
};

const fetchRelatedCompletedTasks = async (
  params: RelatedTasksParams
): Promise<CrmCompletedTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_COMPLETED_TASKS, {
    params: {
      contactId: params.contactId,
      dealId: params.dealId,
      companyId: params.companyId
    }
  });
  return response?.data?.results?.[0];
};

interface UseGetRelatedTasksOptions {
  currentTaskId?: number;
  enabled?: boolean;
}

export const useGetRelatedTasks = (
  params: RelatedTasksParams,
  { currentTaskId, enabled = true }: UseGetRelatedTasksOptions = {}
) => {
  const hasEntity =
    params.contactId != null ||
    params.dealId != null ||
    params.companyId != null;

  return useQuery({
    queryKey: taskQueryKeys.RELATED_TASKS(params),
    queryFn: async () => {
      const openTasksResponse = await fetchRelatedOpenTasks(params);
      const completedTasksResponse = await fetchRelatedCompletedTasks(params);

      return [
        ...(openTasksResponse?.tasks ?? []),
        ...(completedTasksResponse?.items ?? [])
      ];
    },
    enabled: enabled && hasEntity,
    refetchOnWindowFocus: false,
    select: currentTaskId != null
      ? (tasks) => tasks.filter((task) => task.id !== currentTaskId)
      : undefined
  });
};

const createTask = async (taskDetails: CrmTaskCreatePayload) => {
  const response = await authFetch.post(taskEndpoints.CREATE_TASK, taskDetails);
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: () => void,
  onError: () => void,
  contactId?: number
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
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

const fetchOpenTasks = async (
  searchKeyword?: string
): Promise<CrmTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_OPEN_TASKS, {
    params: { searchKeyword }
  });
  return response?.data?.results?.[0];
};

export const useGetOpenTasks = (searchKeyword: string, enabled: boolean) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS_BY_SEARCH(searchKeyword),
    queryFn: () => fetchOpenTasks(searchKeyword),
    enabled
  });
};

const updateTaskStatus = async ({
  id,
  isCompleted
}: UpdateTaskStatusPayload) => {
  await authFetch.patch(taskEndpoints.UPDATE_TASK(id), {
    isCompleted
  });
};

export const useUpdateTaskCompletion = (onError: (error: Error) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_TASK_DATA });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_OPEN_TASKS });
    },
    onError
  });
};

interface TaskSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
}

const fetchCompletedTasks = async ({
  page,
  size,
  searchKeyword
}: TaskSearchParams): Promise<CrmCompletedTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_COMPLETED_TASKS, {
    params: { page, size, searchKeyword }
  });
  return response?.data?.results?.[0];
};

export const useGetCompletedTasks = (
  searchKeyword: string,
  size: number,
  enabled: boolean
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: taskQueryKeys.GET_COMPLETED_TASKS_BY_SEARCH(searchKeyword),
    queryFn: ({ pageParam }) =>
      fetchCompletedTasks({
        page: pageParam,
        size,
        searchKeyword
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
      onSuccess();
    },
    onError
  });
};
