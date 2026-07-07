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

const fetchRelatedTasks = async (
  params: RelatedTasksParams
): Promise<RelatedTasksPage> => {
  const response = await authFetch.get(taskEndpoints.GET_RELATED_TASKS, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetRelatedTasks = (
  params: RelatedTasksParams,
  enabled?: boolean
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: taskQueryKeys.RELATED_TASKS,
    queryFn: () => fetchRelatedTasks(params),
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
  onSuccess?: () => void,
  onError?: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editTask,
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_TASK_DATA
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_TASK_BY_ID(id)
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.RELATED_TASKS
      });
      if (onSuccess) onSuccess();
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
}

export const useGetTaskById = (id: number) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_TASK_BY_ID(id),
    queryFn: () => fetchTaskById(id)
  });
};
