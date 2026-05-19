import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmContactMetricsType,
  CrmContactType,
  CrmDealsResponseType,
  CrmTasksResponseType,
  UpdateContactPayload
} from "~community/crm/types/CommonTypes";

import { crmEndpoints } from "./utils/ApiEndpoints";
import { crmQueryKeys } from "./utils/QueryKeys";

export const useGetContactById = (
  id: number
): UseQueryResult<CrmContactType> => {
  return useQuery({
    queryKey: crmQueryKeys.GET_CONTACT_BY_ID(id),
    queryFn: async () => {
      const response = await authFetch.get(crmEndpoints.GET_CONTACT_BY_ID(id));
      return response?.data?.results[0];
    },
    enabled: !!id
  });
};

export const useGetContactMetrics = (
  id: number
): UseQueryResult<CrmContactMetricsType> => {
  return useQuery({
    queryKey: crmQueryKeys.GET_CONTACT_METRICS(id),
    queryFn: async () => {
      const response = await authFetch.get(
        crmEndpoints.GET_CONTACT_METRICS(id)
      );
      return response?.data?.results[0];
    },
    enabled: !!id
  });
};

export const useGetDealsByContactId = (
  id: number
): UseQueryResult<CrmDealsResponseType> => {
  return useQuery({
    queryKey: crmQueryKeys.GET_DEALS_BY_CONTACT(id),
    queryFn: async () => {
      const response = await authFetch.get(
        crmEndpoints.GET_DEALS_BY_CONTACT(id)
      );
      return response?.data?.results[0];
    },
    enabled: !!id
  });
};

export const useGetTasksByContactId = (
  id: number
): UseQueryResult<CrmTasksResponseType> => {
  return useQuery({
    queryKey: crmQueryKeys.GET_TASKS_BY_CONTACT(id),
    queryFn: async () => {
      const response = await authFetch.get(
        crmEndpoints.GET_TASKS_BY_CONTACT(id)
      );
      return response?.data?.results[0];
    },
    enabled: !!id
  });
};

const updateTaskCompletionFn = async ({
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
  return response.data;
};

export const useUpdateTaskCompletion = (
  onSuccess: () => void,
  onError: (error: Error) => void
): UseMutationResult<
  unknown,
  unknown,
  { id: number; isCompleted: boolean },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTaskCompletionFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contact-tasks"] });
      onSuccess();
    },
    onError
  });
};

const updateContactFn = async ({
  id,
  data
}: {
  id: number;
  data: UpdateContactPayload;
}) => {
  const response = await authFetch.patch(crmEndpoints.UPDATE_CONTACT(id), data);
  return response.data;
};

export const useUpdateContact = (
  onSuccess: () => void,
  onError: (error: Error) => void
): UseMutationResult<
  unknown,
  unknown,
  { id: number; data: UpdateContactPayload },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContactFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: crmQueryKeys.GET_CONTACT_BY_ID(variables.id)
      });
      onSuccess();
    },
    onError
  });
};

const deleteContactFn = async (id: number) => {
  const response = await authFetch.delete(crmEndpoints.DELETE_CONTACT(id));
  return response.data;
};

export const useDeleteContact = (
  onSuccess: () => void,
  onError: (error: Error) => void
): UseMutationResult<unknown, unknown, number, unknown> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContactFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmQueryKeys.GET_CONTACTS });
      onSuccess();
    },
    onError
  });
};
