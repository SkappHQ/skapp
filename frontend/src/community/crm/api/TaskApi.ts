import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { taskEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";
import { CrmTaskCreatePayload } from "../types/CommonTypes";
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

const fetchOpenTasks = async (): Promise<CrmTaskDetailType[]> => {
  const response = await authFetch.get(taskEndpoints.GET_OPEN_TASKS);
  return response?.data?.results?.[0]?.tasks ?? [];
};

export const useGetOpenTasks = () => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS,
    queryFn: fetchOpenTasks
  });
};
