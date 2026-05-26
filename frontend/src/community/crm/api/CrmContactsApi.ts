import { useInfiniteQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { contactEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { contactQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CrmCompaniesResponseType,
  CrmContactMetricsResponseType
} from "~community/crm/types/CommonTypes";

interface ContactMetricsSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
  companyId?: number;
}

const fetchContactMetrics = async ({
  page,
  size,
  searchKeyword,
  companyId
}: ContactMetricsSearchParams): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: {
      page,
      size,
      ...(searchKeyword ? { searchKeyword } : {}),
      ...(companyId !== undefined ? { companyId } : {})
    }
  });
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (
  searchKeyword: string,
  limit: number,
  companyId?: number
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: contactQueryKeys.GET_CONTACT_DATA_BY_SEARCH(
      searchKeyword,
      limit,
      companyId
    ),
    queryFn: ({ pageParam }) =>
      fetchContactMetrics({
        page: pageParam,
        size: limit,
        searchKeyword,
        companyId
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

interface CompaniesLookupParams {
  size: number;
  searchKeyword?: string;
}

export const useGetCrmCompanies = ({
  size,
  searchKeyword
}: CompaniesLookupParams) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: contactQueryKeys.CRM_COMPANIES(size, searchKeyword),
    queryFn: async ({ pageParam }) => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: {
          page: pageParam,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      });
      return response?.data?.results?.[0] as CrmCompaniesResponseType;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};
