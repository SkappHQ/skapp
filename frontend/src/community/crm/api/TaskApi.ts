import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { taskEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { TASK_PAGE_SIZE } from "~community/crm/constants/taskConstants";
import {
  CrmCompletedTaskResponseType,
  CrmTaskCreatePayload,
  CrmTaskResponseType,
  RelatedTasksParams,
  TaskRowResponseType,
  UpdateTaskStatusPayload
} from "~community/crm/types/CommonTypes";

import { contactQueryKeys, taskQueryKeys } from "./utils/QueryKeys";

interface RelatedTasksPage {
  items: TaskRowResponseType[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

const fetchRelatedTasks = async (
  params: RelatedTasksParams,
  page: number
): Promise<RelatedTasksPage> => {
  const response = await authFetch.get(taskEndpoints.GET_RELATED_TASKS, {
    params: {
      contactId: params.contactId,
      dealId: params.dealId,
      page,
      size: TASK_PAGE_SIZE
    }
  });
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (params: RelatedTasksParams) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: taskQueryKeys.RELATED_TASKS,
    queryFn: ({ pageParam }) => fetchRelatedTasks(params, pageParam),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
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
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
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
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
      });
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
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
      });
      onSuccess();
    },
    onError
  });
};
