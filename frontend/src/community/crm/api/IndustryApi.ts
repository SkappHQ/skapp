import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmIndustryEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmIndustryQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CrmIndustryFilterRequest,
  CrmIndustryListResponse
} from "~community/crm/types/CrmTypes";

const fetchIndustryLookup = async (
  params: CrmIndustryFilterRequest
): Promise<CrmIndustryListResponse> => {
  const response = await authFetch.get(crmIndustryEndpoints.INDUSTRY_LOOKUP, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetIndustryLookup = (
  params: CrmIndustryFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmIndustryListResponse> =>
  useQuery({
    queryKey: crmIndustryQueryKeys.LOOKUP(params),
    queryFn: () => fetchIndustryLookup(params),
    enabled,
    refetchOnWindowFocus: false
  });
