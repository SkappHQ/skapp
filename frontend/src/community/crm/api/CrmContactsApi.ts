import { useInfiniteQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { contactEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { contactQueryKeys } from "~community/crm/api/utils/QueryKeys";
import { CrmContactMetricsResponseType } from "~community/crm/types/CommonTypes";

interface ContactMetricsSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
}

const fetchContactMetrics = async ({
  page,
  size,
  searchKeyword
}: ContactMetricsSearchParams): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: {
      page,
      size,
      ...(searchKeyword ? { searchKeyword } : {})
    }
  });
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (searchKeyword: string, limit: number) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: contactQueryKeys.GET_CONTACT_DATA_BY_SEARCH(searchKeyword, limit),
    queryFn: ({ pageParam }) =>
      fetchContactMetrics({
        page: pageParam,
        size: limit,
        searchKeyword
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};
