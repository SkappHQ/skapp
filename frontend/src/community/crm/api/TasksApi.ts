import { useMutation, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { CrmTaskCategory } from "~community/crm/types/CommonTypes";

import { taskEndpoints } from "./utils/ApiEndpoints";
import { taskQueryKeys } from "./utils/QueryKeys";

interface UpdateTaskStatusPayload {
  id: number;
  isCompleted: boolean;
}

const fetchCrmTaskTypes = async (): Promise<CrmTaskCategory[]> => {
  const response = await authFetch.get(taskEndpoints.GET_TASK_TYPES);
  return response?.data?.results?.[0];
};

export const useGetCrmTaskTypes = () => {
  return useQuery({
    queryKey: taskQueryKeys.GET_TASK_TYPES,
    queryFn: fetchCrmTaskTypes
  });
};

const updateTaskStatusFn = async ({
  id,
  isCompleted
}: UpdateTaskStatusPayload): Promise<void> => {
  await authFetch.patch(taskEndpoints.UPDATE_TASK(id), {
    isCompleted
  });
};

export const useUpdateTaskCompletion = (
  onError: (error: Error) => void,
  onSuccess: () => void = () => {}
) => {
  return useMutation({
    mutationFn: updateTaskStatusFn,
    onSuccess: () => {
      // TODO: invalidate contact/company/deals detailed view queries and tasks and task by id once those API layers are implemented
      onSuccess();
    },
    onError
  });
};
