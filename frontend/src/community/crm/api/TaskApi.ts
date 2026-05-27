import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CrmTaskCreatePayload } from "../types/CommonTypes";
import { taskQueryKeys } from "./utils/QueryKeys";

const createTask = async (taskDetails: CrmTaskCreatePayload): Promise<void> => {
  // TODO: Replace with actual API call when backend is ready
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
