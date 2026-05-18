import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCompanyType,
  CrmContactType,
  CrmDealCreateRequestType,
  CrmDealFilterParams,
  CrmDealPaginatedResponseType,
  CrmDealStageType,
  CrmPriorityType
} from "~community/crm/types/CommonTypes";

import {
  crmCompanyEndpoints,
  crmContactEndpoints,
  crmDealEndpoints
} from "./utils/ApiEndpoints";

import {
  crmCompanyQueryKeys,
  crmContactQueryKeys,
  crmDealQueryKeys
} from "./utils/QueryKeys";

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEAL_STAGES);
      return (response?.data?.results ?? []) as CrmDealStageType[];
    },
    staleTime: 5 * 60 * 1000
  });
};

export const useGetPriorities = (): UseQueryResult<CrmPriorityType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.PRIORITIES,
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_PRIORITIES);
      return (response?.data?.results ?? []) as CrmPriorityType[];
    },
    staleTime: 5 * 60 * 1000
  });
};

export const useGetDeals = (
  params: CrmDealFilterParams
): UseQueryResult<CrmDealPaginatedResponseType> => {
  return useQuery({
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEALS(params));
      return (response?.data?.results?.[0] ??
        { items: [], currentPage: 0, totalItems: 0, totalPages: 0 }) as CrmDealPaginatedResponseType;
    }
  });
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: (error: unknown) => void
): UseMutationResult<unknown, unknown, CrmDealCreateRequestType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrmDealCreateRequestType) =>
      authFetch.post(crmDealEndpoints.CREATE_DEAL, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL_DEALS });
      onSuccess();
    },
    onError
  });
};

export const useGetCrmContacts = (
  searchKeyword?: string
): UseQueryResult<CrmContactType[]> => {
  return useQuery({
    queryKey: crmContactQueryKeys.LIST(searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmContactEndpoints.GET_CONTACTS(searchKeyword)
      );
      const results =
        response?.data?.results?.[0]?.items ?? response?.data?.results ?? [];
      return results as CrmContactType[];
    },
    staleTime: 2 * 60 * 1000
  });
};

export const useGetCrmCompanies = (
  searchKeyword?: string
): UseQueryResult<CrmCompanyType[]> => {
  return useQuery({
    queryKey: crmCompanyQueryKeys.LIST(searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmCompanyEndpoints.GET_COMPANIES(searchKeyword)
      );
      const results =
        response?.data?.results?.[0]?.items ?? response?.data?.results ?? [];
      return results as CrmCompanyType[];
    },
    staleTime: 2 * 60 * 1000
  });
};

