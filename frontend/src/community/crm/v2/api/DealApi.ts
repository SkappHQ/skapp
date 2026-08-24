import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { crmDealEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmDealQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import {
  CrmDealFilterRequest,
  CrmDealListResponse
} from "~community/crm/v2/types/CrmTypes";

const fetchDealLookup = async (
  params: CrmDealFilterRequest
): Promise<CrmDealListResponse> => {
  const response = await authFetchV2.get(crmDealEndpoints.GET_DEALS, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetDealLookup = (
  params: CrmDealFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmDealListResponse> =>
  useQuery({
    queryKey: crmDealQueryKeys.LOOKUP(params),
    queryFn: () => fetchDealLookup(params),
    enabled
  });
