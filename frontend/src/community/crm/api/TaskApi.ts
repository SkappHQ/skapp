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
  CrmTaskResponseType,
  CrmTaskUpdatePayload,
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

// TODO: remove mock before merging
const USE_MOCK_RELATED_TASKS = true;

const MOCK_RELATED_TASKS: RelatedTasksPage = {
  items: [
    {
      id: 1,
      name: "Follow up with the enterprise client regarding the Q3 renewal proposal and outstanding contract amendments",
      typeName: "Call",
      priority: "HIGH" as any,
      isCompleted: false,
      dueAt: "2026-07-05T10:00:00Z",
      owner: {
        employeeId: 1,
        firstName: "Alice",
        lastName: "Smith",
        authPic: null
      },
      contact: {
        id: 10,
        name: "John Doe",
        company: { id: 5, name: "Acme Corp" }
      }
    },
    {
      id: 2,
      name: "Send proposal document",
      typeName: "Email",
      priority: "MEDIUM" as any,
      isCompleted: false,
      dueAt: "2026-07-10T09:00:00Z",
      owner: {
        employeeId: 2,
        firstName: "Bob",
        lastName: "Johnson",
        authPic: null
      },
      contact: {
        id: 10,
        name: "John Doe",
        company: { id: 5, name: "Acme Corp" }
      }
    },
    {
      id: 3,
      name: "Schedule product demo",
      typeName: "Meeting",
      priority: "LOW" as any,
      isCompleted: true,
      dueAt: "2026-06-28T14:00:00Z",
      owner: {
        employeeId: 1,
        firstName: "Alice",
        lastName: "Smith",
        authPic: null
      },
      contact: null
    }
  ],
  totalItems: 3,
  currentPage: 0,
  totalPages: 1
};

const fetchRelatedTasks = async (
  params: RelatedTasksParams,
  page: number
): Promise<RelatedTasksPage> => {
  if (USE_MOCK_RELATED_TASKS) return Promise.resolve(MOCK_RELATED_TASKS);

  const response = await authFetch.get(taskEndpoints.GET_RELATED_TASKS, {
    params
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

const editTask = async ({ id, ...payload }: CrmTaskUpdatePayload) => {
  const response = await authFetch.patch(
    taskEndpoints.UPDATE_TASK(id),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      await queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_TASK_DATA
      });
      onSuccess();
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
