import {
  UseMutationResult,
  UseQueryResult,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCompanyLookupType,
  CrmCompanyType,
  CrmContactType,
  CrmDealCreateRequestType,
  CrmDealFilterParams,
  CrmDealPaginatedResponseType,
  CrmDealStageType,
  CrmOwnerType
} from "~community/crm/types/CommonTypes";

import {
  crmCompanyEndpoints,
  crmContactEndpoints,
  crmDealEndpoints
} from "./utils/ApiEndpoints";
import {
  CRM_COMPANIES_KEY,
  CRM_COMPANY_LOOKUP_KEY,
  CRM_CONTACTS_KEY,
  CRM_DEALS_KEY,
  CRM_OWNERS_KEY,
  crmDealQueryKeys,
  crmQueryKeys
} from "./utils/QueryKeys";

export const useGetDealsInfinite = (
  params: Omit<CrmDealFilterParams, "page">
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async ({ pageParam }) => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
        params: { ...params, page: pageParam }
      });
      return response?.data?.results?.[0] as CrmDealPaginatedResponseType;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    },
    placeholderData: keepPreviousData
  });
};

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.STAGES(CRM_DEALS_KEY),
    queryFn: async () => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEAL_STAGES);
      return (response?.data?.results ?? []) as CrmDealStageType[];
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

export const useGetCrmOwners = (
  searchKeyword?: string
): UseQueryResult<CrmOwnerType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.LIST(CRM_OWNERS_KEY, searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmContactEndpoints.GET_OWNERS({ searchKeyword })
      );
      const results: CrmOwnerType[] =
        response?.data?.results?.items ?? [];
      return results;
    }
  });
};

export const useGetCrmCompaniesLookup = (
  searchKeyword?: string
): UseQueryResult<CrmCompanyLookupType[]> => {
  return useQuery({
    queryKey: crmQueryKeys.LIST(CRM_COMPANY_LOOKUP_KEY, searchKeyword),
    queryFn: async () => {
      const response = await authFetch.get(
        crmCompanyEndpoints.GET_COMPANY_LOOKUP({ searchKeyword })
      );
      const results: CrmCompanyLookupType[] =
        response?.data?.results?.items ?? [];
      return results;
    }
  });
};
