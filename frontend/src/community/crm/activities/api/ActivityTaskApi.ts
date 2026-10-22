import {
  UseMutationResult,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import { crmActivityEndpoints } from "~community/crm/activities/api/utils/ApiEndpoints";
import { markFeedCacheStale } from "~community/crm/activities/api/utils/activityFeedCache";
import { getViewerTimezone } from "~community/crm/activities/api/utils/activityFeedParams";
import { ActivityRow } from "~community/crm/activities/types/activityTypes";

export interface CompleteActivityTaskRequest {
  id: number;
  isCompleted: boolean;
}

const completeActivityTask = async ({
  id,
  isCompleted
}: CompleteActivityTaskRequest): Promise<ActivityRow> => {
  const response = await authFetch.patch(
    crmActivityEndpoints.COMPLETE_TASK(id),
    { isCompleted },
    { headers: { [TIMEZONE_HEADER]: getViewerTimezone() } }
  );
  return response?.data?.results?.[0];
};

export const useCompleteActivityTask = (
  onSuccess?: (
    updatedRow: ActivityRow,
    request: CompleteActivityTaskRequest
  ) => void,
  onError?: (error: AxiosError, request: CompleteActivityTaskRequest) => void
): UseMutationResult<ActivityRow, AxiosError, CompleteActivityTaskRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeActivityTask,
    onSuccess: (updatedRow, request) => {
      onSuccess?.(updatedRow, request);
      void markFeedCacheStale(queryClient);
    },
    onError: (error, request) => {
      onError?.(error, request);
    }
  });
};
