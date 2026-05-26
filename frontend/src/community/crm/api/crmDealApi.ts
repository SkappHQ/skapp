import {
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCompanyType,
  CrmContactType,
  CrmDealCreateRequestType,
  CrmDealFilterParams,
  CrmDealPaginatedResponseType,
  CrmDealStageType
} from "~community/crm/types/CommonTypes";

import {
  crmCompanyEndpoints,
  crmContactEndpoints,
  crmDealEndpoints
} from "./utils/ApiEndpoints";

import {
  CRM_COMPANIES_KEY,
  CRM_CONTACTS_KEY,
  CRM_DEALS_KEY,
  crmQueryKeys
} from "./utils/QueryKeys";

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.STAGES(CRM_DEALS_KEY),
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEAL_STAGES);
      return (response?.data?.results ?? []) as CrmDealStageType[];
    }
  });
};

export const useGetDealsInfinite = (
  params: Omit<CrmDealFilterParams, "page">
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmQueryKeys.FILTERED(CRM_DEALS_KEY, params),
    queryFn: async ({ pageParam }) => {
      const response = await authFetch.get(
        crmDealEndpoints.GET_DEALS({ ...params, page: pageParam as number })
      );
      return (response?.data?.results?.[0] ?? {
        items: [],
        currentPage: 0,
        totalItems: 0,
        totalPages: 0
      }) as CrmDealPaginatedResponseType;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: (error: unknown) => void
): UseMutationResult<unknown, unknown, CrmDealCreateRequestType> => {
  return useMutation({
    mutationFn: (payload: CrmDealCreateRequestType) =>
      authFetch.post(crmDealEndpoints.CREATE_DEAL, payload),
    onSuccess,
    onError
  });
};

export const useGetCrmContacts = (
  searchKeyword?: string
): UseQueryResult<CrmContactType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.LIST(CRM_CONTACTS_KEY, searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmContactEndpoints.GET_CONTACTS(searchKeyword)
      );
      const results =
        response?.data?.results?.[0]?.items ?? response?.data?.results ?? [];
      return results as CrmContactType[];
    }
  });
};

export const useGetCrmCompanies = (
  searchKeyword?: string
): UseQueryResult<CrmCompanyType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.LIST(CRM_COMPANIES_KEY, searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmCompanyEndpoints.GET_COMPANIES(searchKeyword)
      );
      const results =
        response?.data?.results?.[0]?.items ?? response?.data?.results ?? [];
      return results as CrmCompanyType[];
    }
  });
};

