import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { TIMEZONE_HEADER } from "~community/common/constants/configs";
import authFetch from "~community/common/utils/axiosInterceptor";
import { crmActivityEndpoints } from "~community/crm/activities/api/utils/ApiEndpoints";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  keepMonthStable,
  markFeedCacheStale,
  patchTaskInFeedCache,
  toFeedRowPatch
} from "~community/crm/activities/api/utils/activityFeedCache";
import { getViewerTimezone } from "~community/crm/activities/api/utils/activityFeedParams";
import {
  ActivityTaskDetailResponse,
  toActivityTaskDetail
} from "~community/crm/activities/api/utils/activityTaskMapper";
import {
  ActivityRow,
  ActivityTaskDetail,
  ActivityTaskUpdate
} from "~community/crm/activities/types/activityTypes";

export interface CompleteActivityTaskRequest {
  id: number;
  isCompleted: boolean;
}

export interface UpdateActivityTaskRequest {
  id: number;
  fields: ActivityTaskUpdate;
}

interface UpdateActivityTaskContext {
  previousDetail: ActivityTaskDetail | null;
}

const timezoneHeaders = () => ({
  headers: { [TIMEZONE_HEADER]: getViewerTimezone() }
});

const fetchActivityTaskDetail = async (
  id: number
): Promise<ActivityTaskDetail> => {
  const response = await authFetch.get(
    crmActivityEndpoints.GET_TASK_DETAIL(id),
    timezoneHeaders()
  );
  return toActivityTaskDetail(response?.data?.results?.[0]);
};

export const useGetActivityTaskDetail = (
  id: number | null
): UseQueryResult<ActivityTaskDetail, AxiosError> =>
  useQuery({
    queryKey: crmActivityQueryKeys.TASK_DETAIL(id ?? 0),
    queryFn: () => fetchActivityTaskDetail(id ?? 0),
    enabled: id !== null,
    refetchOnWindowFocus: false
  });

const updateActivityTask = async ({
  id,
  fields
}: UpdateActivityTaskRequest): Promise<ActivityTaskDetail> => {
  const response = await authFetch.patch(
    crmActivityEndpoints.UPDATE_TASK(id),
    fields,
    timezoneHeaders()
  );
  return toActivityTaskDetail(
    response?.data?.results?.[0] as ActivityTaskDetailResponse
  );
};

export const useUpdateActivityTask = (
  onSuccess?: (updatedTask: ActivityTaskDetail) => void,
  onError?: (error: AxiosError, request: UpdateActivityTaskRequest) => void
): UseMutationResult<
  ActivityTaskDetail,
  AxiosError,
  UpdateActivityTaskRequest,
  UpdateActivityTaskContext
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivityTask,
    onMutate: async ({ id, fields }) => {
      const queryKey = crmActivityQueryKeys.TASK_DETAIL(id);

      await queryClient.cancelQueries({ queryKey });

      const previousDetail =
        queryClient.getQueryData<ActivityTaskDetail>(queryKey) ?? null;

      if (previousDetail) {
        queryClient.setQueryData<ActivityTaskDetail>(queryKey, {
          ...previousDetail,
          ...fields
        });
      }

      return { previousDetail };
    },
    onError: (error, request, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          crmActivityQueryKeys.TASK_DETAIL(request.id),
          context.previousDetail
        );
      }
      onError?.(error, request);
    },
    onSuccess: (updatedTask, { id }) => {
      queryClient.setQueryData(
        crmActivityQueryKeys.TASK_DETAIL(id),
        updatedTask
      );
      patchTaskInFeedCache(
        queryClient,
        id,
        keepMonthStable(toFeedRowPatch(updatedTask))
      );
      void markFeedCacheStale(queryClient);
      onSuccess?.(updatedTask);
    }
  });
};

const completeActivityTask = async ({
  id,
  isCompleted
}: CompleteActivityTaskRequest): Promise<ActivityRow> => {
  const response = await authFetch.patch(
    crmActivityEndpoints.COMPLETE_TASK(id),
    { isCompleted },
    timezoneHeaders()
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
      queryClient.setQueryData<ActivityTaskDetail>(
        crmActivityQueryKeys.TASK_DETAIL(request.id),
        (detail) =>
          detail
            ? {
                ...detail,
                isCompleted: updatedRow?.isCompleted ?? request.isCompleted,
                completedAt: updatedRow?.completedAt ?? null
              }
            : detail
      );
      onSuccess?.(updatedRow, request);
      void markFeedCacheStale(queryClient);
    },
    onError: (error, request) => {
      onError?.(error, request);
    }
  });
};
