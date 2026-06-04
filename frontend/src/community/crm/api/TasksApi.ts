import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { CrmTaskCategory } from "~community/crm/types/CommonTypes";

import { taskEndpoints } from "./utils/ApiEndpoints";
import { taskQueryKeys } from "./utils/QueryKeys";

const fetchCrmTaskTypes = async (): Promise<CrmTaskCategory[]> => {
  const response = await authFetch.get(taskEndpoints.GET_TASK_TYPES);
  return response?.data?.results ?? [];
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
}: {
  id: number;
  isCompleted: boolean;
}) => {
  const response = await authFetch.patch(taskEndpoints.UPDATE_TASK(id), {
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
      // TODO: invalidate contact/company/deals detailed view queries and tasks and task by id once those API layers are implemented
      onSuccess();
    },
    onError
  });
};
