import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmTaskCategory,
  UpdateTaskStatusPayload
} from "~community/crm/types/CommonTypes";

import { CrmTaskCreatePayload } from "../types/CommonTypes";
import { taskEndpoints } from "./utils/ApiEndpoints";
import { taskQueryKeys } from "./utils/QueryKeys";

const createTask = async (taskDetails: CrmTaskCreatePayload): Promise<void> => {
  // TODO: Replace with actual API call when backend is ready
  throw new Error("createTask is not yet implemented");
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
    onError,
    onSettled: () => {
      // TODO: invalidate contact/company/deals detailed view queries once those API layers are implemented
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_TASK_DATA });
    }
  });
};
