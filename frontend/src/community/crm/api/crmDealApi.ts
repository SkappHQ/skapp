import {
  UseInfiniteQueryResult,
  useInfiniteQuery
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmDealFilterParams,
  CrmDealPaginatedResponseType
} from "~community/crm/types/CommonTypes";
import { crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

export const useGetDealsInfinite = (
  params: CrmDealFilterParams
): UseInfiniteQueryResult<CrmDealPaginatedResponseType> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
        params: {
          page: pageParam,
          ...params
        }
      });
      return response?.data?.results?.[0] as CrmDealPaginatedResponseType;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};
