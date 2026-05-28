import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmDealFilterParams,
  CrmDealPaginatedResponseType
} from "~community/crm/types/CommonTypes";
import { crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

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
