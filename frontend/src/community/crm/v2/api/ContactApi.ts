import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmContactEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmContactQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import {
  CrmContactFilterRequest,
  CrmContactListResponse,
  CrmOwnerListResponse,
  CrmOwnerLookupFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const fetchContactLookup = async (
  params: CrmContactFilterRequest
): Promise<CrmContactListResponse> => {
  const response = await authFetch.get(crmContactEndpoints.CONTACT_LOOKUP, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetContactLookup = (
  params: CrmContactFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmContactListResponse> =>
  useQuery({
    queryKey: crmContactQueryKeys.LOOKUP(params),
    queryFn: () => fetchContactLookup(params),
    enabled
  });

const fetchOwnerLookup = async (
  params: CrmOwnerLookupFilterRequest
): Promise<CrmOwnerListResponse> => {
  const response = await authFetch.get(crmContactEndpoints.OWNER_LOOKUP, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetOwnerLookup = (
  params: CrmOwnerLookupFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmOwnerListResponse> =>
  useQuery({
    queryKey: crmContactQueryKeys.OWNER_LOOKUP(params),
    queryFn: () => fetchOwnerLookup(params),
    enabled
  });
