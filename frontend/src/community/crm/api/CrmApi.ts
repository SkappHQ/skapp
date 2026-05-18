import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { rejects } from "assert";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmContactMetricsType,
  CrmContactType,
  UpdateContactPayload
} from "~community/crm/types/CrmContactTypes";
import { CrmDealsResponseType } from "~community/crm/types/CrmDealTypes";
import { CrmTasksResponseType } from "~community/crm/types/CrmTaskTypes";

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
      return { items: response?.data?.results ?? [] };
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
      return { items: response?.data?.results ?? [] };
    },
    enabled: !!id
  });
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: (error: string) => void
): UseMutationResult<unknown, unknown, Record<string, unknown>, unknown> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealData: Record<string, unknown>) =>
      authFetch.post(crmEndpoints.CREATE_DEAL, dealData),
    onSuccess: (_, variables) => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: crmQueryKeys.GET_DEALS_BY_CONTACT(
            variables.contactId as number
          )
        })
        .catch(rejects);
    },
    onError: (error: any) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

export const useUpdateTaskCompletion = (
  onSuccess: () => void,
  onError: (error: string) => void
): UseMutationResult<
  unknown,
  unknown,
  { id: number; isCompleted: boolean },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      authFetch.patch(crmEndpoints.UPDATE_TASK_COMPLETION(id), {
        isCompleted
      }),
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({ queryKey: ["crm-contact-tasks"] })
        .catch(rejects);
    },
    onError: (error: any) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

export const useUpdateContact = (
  onSuccess: () => void,
  onError: (error: string) => void
): UseMutationResult<
  unknown,
  unknown,
  { id: number; data: UpdateContactPayload },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactPayload }) =>
      authFetch.put(crmEndpoints.UPDATE_CONTACT(id), data),
    onSuccess: (_, variables) => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: crmQueryKeys.GET_CONTACT_BY_ID(variables.id)
        })
        .catch(rejects);
    },
    onError: (error: any) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

export const useDeleteContact = (
  onSuccess: () => void,
  onError: (error: string) => void
): UseMutationResult<unknown, unknown, number, unknown> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      authFetch.patch(crmEndpoints.DELETE_CONTACT(id)),
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({ queryKey: crmQueryKeys.GET_CONTACTS })
        .catch(rejects);
    },
    onError: (error: any) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
