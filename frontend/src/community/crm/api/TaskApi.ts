import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CrmTaskCreatePayload } from "../types/CommonTypes";
import { taskQueryKeys } from "./utils/QueryKeys";

const createTask = async (
  _payload: CrmTaskCreatePayload
): Promise<void> => {
  // TODO: Replace with actual API call when backend is ready
  // const response = await authFetch.post(taskEndpoints.CREATE_TASK, _payload);
  // return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: () => void,
  onError: () => void
) => {
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
