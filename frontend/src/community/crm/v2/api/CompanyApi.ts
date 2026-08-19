import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmCompanyEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmCompanyQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { CrmCompaniesByIdsRequest } from "~community/crm/v2/types/CrmTypes";

const fetchCompaniesByIds = async (
  payload: CrmCompaniesByIdsRequest
): Promise<CrmCompanyEntity[]> => {
  const response = await authFetch.post(
    crmCompanyEndpoints.GET_COMPANIES_BY_IDS,
    payload
  );
  return response?.data?.results;
};

export const useGetCompaniesByIds = (
  companyIds: number[],
  enabled: boolean
): UseQueryResult<CrmCompanyEntity[]> => {
  return useQuery({
    queryKey: crmCompanyQueryKeys.COMPANIES_BY_IDS(companyIds),
    queryFn: () => fetchCompaniesByIds({ ids: companyIds }),
    enabled
  });
};
