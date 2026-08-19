import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmDealEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmDealQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmDealsByIdsRequest } from "~community/crm/v2/types/CrmTypes";

const fetchDealsByIds = async (
  payload: CrmDealsByIdsRequest
): Promise<CrmDealEntity[]> => {
  const response = await authFetch.post(
    crmDealEndpoints.GET_DEALS_BY_IDS,
    payload
  );
  return response?.data?.results;
};

export const useGetDealsByIds = (
  dealIds: number[],
  enabled: boolean
): UseQueryResult<CrmDealEntity[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEALS_BY_IDS(dealIds),
    queryFn: () => fetchDealsByIds({ ids: dealIds }),
    enabled
  });
};
