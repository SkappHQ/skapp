import {
  UseQueryResult,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  companyEndpoints,
  contactEndpoints
} from "~community/crm/api/utils/ApiEndpoints";
import {
  companyQueryKeys,
  contactQueryKeys
} from "~community/crm/api/utils/QueryKeys";
import {
  CrmCompaniesResponseType,
  CrmContactLookup,
  CrmContactMetricsResponseType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

interface ContactMetricsSearchParams {
  page: number;
  size: number;
  searchKeyword?: string;
  companyId?: number;
}

const fetchContactMetrics = async ({
  page,
  size,
  searchKeyword,
  companyId
}: ContactMetricsSearchParams): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: { page, size, searchKeyword, companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (
  searchKeyword: string,
  size: number,
  companyId?: number
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: contactQueryKeys.GET_CONTACT_DATA_BY_SEARCH(
      searchKeyword,
      companyId
    ),
    queryFn: ({ pageParam }) =>
      fetchContactMetrics({
        page: pageParam,
        size,
        searchKeyword,
        companyId
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    }
  });
};

export const useGetCrmCompanies = (size: number) => {
  return useQuery({
    queryKey: companyQueryKeys.CRM_COMPANIES(size),
    queryFn: async (): Promise<CrmCompaniesResponseType> => {
      const response = await authFetch.get(companyEndpoints.GET_COMPANIES, {
        params: { size }
      });
      return response?.data?.results?.[0];
    }
  });
};

export const useGetCrmContacts = (
  searchKeyword: string,
  size: number,
  enabled: boolean = true
): UseQueryResult<CrmContactLookup[]> => {
  return useQuery({
    queryKey: contactQueryKeys.CONTACT_LOOKUP(searchKeyword, size),
    queryFn: async (): Promise<CrmContactLookup[]> => {
      const response = await authFetch.get(contactEndpoints.CONTACT_LOOKUP, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    },
    enabled
  });
};

export const useGetCrmOwners = (
  searchKeyword: string,
  size: number,
  enabled: boolean = true
): UseQueryResult<CrmOwner[]> => {
  return useQuery({
    queryKey: contactQueryKeys.OWNER_LOOKUP(searchKeyword, size),
    queryFn: async (): Promise<CrmOwner[]> => {
      const response = await authFetch.get(contactEndpoints.OWNER_LOOKUP, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    },
    enabled
  });
};
