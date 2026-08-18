import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";

import { crmContactEndpointsV2 } from "./utils/ApiEndpoints";
import { crmContactQueryKeys } from "./utils/QueryKeys";

const fetchContactsByIds = async (
  ids: number[]
): Promise<CrmContactEntity[]> => {
  const response = await authFetchV2.post(
    crmContactEndpointsV2.GET_CONTACTS_BY_IDS,
    { ids }
  );
  return response?.data?.results ?? [];
};

// Batch-hydrate contacts by id (base details only). Used to fill the `contacts`
// record for scalar deal/board cards that reference a contact the store hasn't
// loaded yet. Modeled as a query (idempotent read) despite the POST verb.
export const useGetContactsByIds = (
  ids: number[],
  enabled: boolean
): UseQueryResult<CrmContactEntity[]> =>
  useQuery({
    queryKey: crmContactQueryKeys.CONTACTS_BY_IDS(ids),
    queryFn: () => fetchContactsByIds(ids),
    enabled,
    refetchOnWindowFocus: false
  });
