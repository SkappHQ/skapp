import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { taskEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import {
  CrmTaskCreatePayload,
  CrmTaskResponseType,
  CrmTaskUpdatePayload,
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
        queryKey: taskQueryKeys.GET_TASK_DATA
      });
      onSuccess();
    },
    onError
  });
};

const fetchOpenTasks = async (): Promise<CrmTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_OPEN_TASKS);
  return response?.data?.results?.[0];
};

export const useGetOpenTasks = () => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS,
    queryFn: fetchOpenTasks
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
      onSuccess();
    },
    onError
  });
};

const editTask = async ({
  id,
  ...payload
}: CrmTaskUpdatePayload) => {
  const response = await authFetch.patch(
    taskEndpoints.EDIT_TASK(id),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_OPEN_TASKS
      });
      onSuccess();
    },
    onError
  });
};
