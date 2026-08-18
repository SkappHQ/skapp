import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";

import { crmCompanyEndpointsV2 } from "./utils/ApiEndpoints";
import { crmCompanyQueryKeys } from "./utils/QueryKeys";

const fetchCompaniesByIds = async (
  ids: number[]
): Promise<CrmCompanyEntity[]> => {
  const response = await authFetchV2.post(
    crmCompanyEndpointsV2.GET_COMPANIES_BY_IDS,
    { ids }
  );
  return response?.data?.results ?? [];
};

// Batch-hydrate companies by id (base details only). Used to fill the `companies`
// record for scalar deal/board cards that reference a company the store hasn't
// loaded yet. Modeled as a query (idempotent read) despite the POST verb.
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
