import { useMutation, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import { taskEndpoints } from "./utils/ApiEndpoints";
import { taskQueryKeys } from "./utils/QueryKeys";

const updateTaskStatusFn = async ({
  id,
  isCompleted
}: {
  id: number;
  isCompleted: boolean;
}) => {
  const response = await authFetch.patch(taskEndpoints.UPDATE_TASK_STATUS(id), {
    isCompleted
  });
  return response.data;
};

export const useUpdateTaskCompletion = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskStatusFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
