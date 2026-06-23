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
  CrmTaskDetailType,
  CrmTaskCreatePayload,
  CrmTaskResponseType,
  UpdateTaskStatusPayload
} from "~community/crm/types/CommonTypes";

import { taskQueryKeys } from "./utils/QueryKeys";

const createTask = async (taskDetails: CrmTaskCreatePayload) => {
  const response = await authFetch.post(taskEndpoints.CREATE_TASK, taskDetails);
  return response?.data?.results?.[0];
};

export const useCreateTask = (onSuccess: () => void, onError: () => void) => {
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

export const useGetOpenTasks = ( searchKeyword: string, enabled: boolean) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS_BY_SEARCH(searchKeyword),
    queryFn: () => fetchOpenTasks(searchKeyword),
    enabled
  });
};

const fetchTaskById = async (id: number): Promise<CrmTaskDetailType> => {
  const response = await authFetch.get(taskEndpoints.GET_TASK_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetTaskById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: taskQueryKeys.TASK_BY_ID(id),
    queryFn: () => fetchTaskById(id),
    enabled,
    refetchOnWindowFocus: false
  });
};

const fetchTasksByFilter = async (filters: {
  contactId?: number;
  dealId?: number;
}): Promise<CrmTaskDetailType[]> => {
  const response = await authFetch.get(taskEndpoints.GET_TASKS, {
    params: filters
  });
  return response?.data?.results?.[0]?.tasks ?? [];
};

export const useGetRelatedTasks = (
  contactId: number | null,
  dealId: number | null,
  currentTaskId: number | undefined,
  enabled = true
) => {
  return useQuery({
    queryKey: taskQueryKeys.RELATED_TASKS(contactId, dealId, currentTaskId),
    queryFn: async () => {
      const requests: Promise<CrmTaskDetailType[]>[] = [];

      if (contactId != null) {
        requests.push(fetchTasksByFilter({ contactId }));
      }

      if (dealId != null) {
        requests.push(fetchTasksByFilter({ dealId }));
      }

      const resultSets = await Promise.all(requests);

      if (resultSets.length === 1) {
        return resultSets[0].filter((task) => task.id !== currentTaskId);
      }

      const taskMap = new Map<number, CrmTaskDetailType>();
      resultSets.flat().forEach((task) => {
        if (task.id !== currentTaskId) {
          taskMap.set(task.id, task);
        }
      });

      return Array.from(taskMap.values());
    },
    enabled: enabled && (contactId != null || dealId != null),
    refetchOnWindowFocus: false
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

export const useUpdateTaskCompletion = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_TASK_DATA });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_OPEN_TASKS });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.TASK_BY_ID_ALL });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS_ALL
      });
      onSuccess();
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
    queryKey: taskQueryKeys.GET_COMPLETED_TASKS_BY_SEARCH(searchKeyword, size),

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
