import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";

import { crmCompanyEndpointsV1 } from "./utils/ApiEndpoints";
import { crmCompanyQueryKeys } from "./utils/QueryKeys";

const fetchCompaniesByIds = async (
  ids: number[]
): Promise<CrmCompanyEntity[]> => {
  const response = await authFetch.post(
    crmCompanyEndpointsV1.GET_COMPANIES_BY_IDS,
    { ids }
  );
  return response?.data?.results ?? [];
};

export const useGetCompaniesByIds = (
  ids: number[],
  enabled: boolean
): UseQueryResult<CrmCompanyEntity[]> =>
  useQuery({
    queryKey: crmCompanyQueryKeys.COMPANIES_BY_IDS(ids),
    queryFn: () => fetchCompaniesByIds(ids),
    enabled,
    refetchOnWindowFocus: false
  });
