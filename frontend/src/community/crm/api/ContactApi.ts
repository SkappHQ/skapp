import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
    queryKey: contactQueryKeys.CRM_COMPANIES,
    queryFn: async (): Promise<CrmCompaniesResponseType> => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: { size }
      });
      return response?.data?.results?.[0];
    }
  });
};
