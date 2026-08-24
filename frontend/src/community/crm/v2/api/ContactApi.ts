import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import { crmContactEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import {
  crmContactQueryKeys,
  crmLookupQueryKeys
} from "~community/crm/v2/api/utils/QueryKeys";
import {
  CrmContactFilterRequest,
  CrmContactListResponse,
  CrmContactLookupResponse,
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

const fetchContactLookupV2 = async (
  searchKeyword: string,
  size: number
): Promise<CrmContactLookupResponse> => {
  const response = await authFetchV2.get(crmLookupEndpoints.CONTACT_LOOKUP, {
    params: { searchKeyword, size }
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

export const useGetContactLookupV2 = (
  searchKeyword: string,
  size: number,
  enabled: boolean
) =>
  useQuery({
    queryKey: crmLookupQueryKeys.CONTACT_LOOKUP(searchKeyword, size),
    queryFn: () => fetchContactLookupV2(searchKeyword, size),
    enabled,
    refetchOnWindowFocus: false
  });

export const useGetOwnerLookup = (
  params: CrmOwnerLookupFilterRequest,
  enabled?: boolean
): UseQueryResult<CrmOwnerListResponse> =>
  useQuery({
    queryKey: crmContactQueryKeys.OWNER_LOOKUP(params),
    queryFn: () => fetchOwnerLookup(params),
    enabled,
    refetchOnWindowFocus: false
  });
