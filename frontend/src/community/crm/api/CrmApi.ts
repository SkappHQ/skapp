import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { CrmTasksResponseType } from "~community/crm/types/CrmTaskTypes";

import { crmEndpoints } from "./utils/ApiEndpoints";
import { crmQueryKeys } from "./utils/QueryKeys";

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const useGetTasksByCompanyId = (companyId: number) => {
  return useQuery({
    queryKey: crmQueryKeys.GET_TASKS_BY_COMPANY(companyId),
    queryFn: async () => {
      const response = await authFetch.get(
        crmEndpoints.GET_TASKS_BY_COMPANY(companyId)
      );
      return response?.data as CrmTasksResponseType;
    },
    enabled: companyId > 0
  });
};

export const useUpdateTaskCompletion = (
  onSuccess: () => void,
  onError: (messageKey: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      isCompleted
    }: {
      id: number;
      isCompleted: boolean;
    }) => {
      const response = await authFetch.patch(
        crmEndpoints.UPDATE_TASK_COMPLETION(id),
        { isCompleted }
      );
      return response.data.results[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-tasks-by-company"]
      });
      onSuccess();
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
