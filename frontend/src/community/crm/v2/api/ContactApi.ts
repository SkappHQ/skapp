import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import {
  CrmContactLookupResponse,
  CrmOwnerListResponse
} from "~community/crm/v2/types/CrmTypes";

import { crmLookupEndpoints } from "./utils/ApiEndpoints";
import { crmLookupQueryKeys } from "./utils/QueryKeys";

const fetchContactLookup = async (
  searchKeyword: string,
  size: number
): Promise<CrmContactLookupResponse> => {
  const response = await authFetchV2.get(crmLookupEndpoints.CONTACT_LOOKUP, {
    params: { searchKeyword, size }
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
    queryFn: () => fetchContactLookup(searchKeyword, size),
    enabled,
    refetchOnWindowFocus: false
  });

const fetchOwnerLookup = async (
  searchKeyword: string,
  size: number
): Promise<CrmOwnerListResponse> => {
  const response = await authFetch.get(crmLookupEndpoints.OWNER_LOOKUP, {
    params: { searchKeyword, size }
  });
  return response?.data?.results?.[0];
};

export const useGetOwnerLookupV2 = (
  searchKeyword: string,
  size: number,
  enabled: boolean
): UseQueryResult<CrmOwnerListResponse> =>
  useQuery({
    queryKey: crmLookupQueryKeys.OWNER_LOOKUP(searchKeyword, size),
    queryFn: () => fetchOwnerLookup(searchKeyword, size),
    enabled,
    refetchOnWindowFocus: false
  });
