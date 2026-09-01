import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  useInfiniteQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { crmTaskEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import {
  crmCompanyQueryKeys,
  crmContactQueryKeys,
  crmTaskQueryKeys
} from "~community/crm/v2/api/utils/QueryKeys";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmTaskFilterRequest,
  CrmTaskListResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchTasks = async (
  params: CrmTaskFilterRequest
): Promise<CrmTaskListResponse> => {
  const response = await authFetchV2.get(crmTaskEndpoints.GET_TASKS, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetTasksInfinite = (
  params: CrmTaskFilterRequest
): UseInfiniteQueryResult<InfiniteData<CrmTaskListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmTaskQueryKeys.LIST(params),
    queryFn: ({ pageParam }) => fetchTasks({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage.currentPage < lastPage.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false
  });

const createTask = async (payload: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const response = await authFetchV2.post(
    crmTaskEndpoints.CREATE_TASK,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateTask = (
  onSuccess: (task: CrmTaskEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskEntity> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (createdTask) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      if (createdTask.companyId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmCompanyQueryKeys.METRICS(createdTask.companyId)
        });
      }
      if (createdTask.contactId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.METRICS(createdTask.contactId)
        });
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.LISTS
        });
      }
      onSuccess(createdTask);
    },
    onError
  });
};

const updateTask = async (task: CrmTaskEntity): Promise<CrmTaskEntity> => {
  const { id, ...payload } = task;
  const response = await authFetchV2.patch(
    crmTaskEndpoints.UPDATE_TASK(id!),
    payload
  );
  return response?.data?.results?.[0];
};

export const useUpdateTask = (
  onSuccess: (task: CrmTaskEntity) => void
): UseMutationResult<CrmTaskEntity, AxiosError, CrmTaskEntity> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      if (updatedTask.companyId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmCompanyQueryKeys.METRICS(updatedTask.companyId)
        });
      }
      if (updatedTask.contactId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: crmContactQueryKeys.METRICS(updatedTask.contactId)
        });
      }
      onSuccess(updatedTask);
    }
  });
};
