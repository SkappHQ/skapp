import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch, {
  authFetchV2
} from "~community/common/utils/axiosInterceptor";
import {
  crmContactEndpoints,
  crmLookupEndpoints
} from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmContactQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import { CrmContactMetrics } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmContactListResponse,
  CrmOwnerListResponse,
  CrmOwnerLookupFilterRequest
} from "~community/crm/v2/types/CrmTypes";

const fetchContacts = async (
  params: CrmContactFilterRequest
): Promise<CrmContactListResponse> => {
  const response = await authFetchV2.get(crmContactEndpoints.GET_CONTACTS, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetContactsInfinite = (
  params: CrmContactFilterRequest
): UseInfiniteQueryResult<InfiniteData<CrmContactListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmContactQueryKeys.LIST(params),
    queryFn: ({ pageParam }) => fetchContacts({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage.currentPage < lastPage.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false
  });

const fetchContactMetrics = async (id: number): Promise<CrmContactMetrics> => {
  const response = await authFetch.get(
    crmContactEndpoints.GET_CONTACT_METRICS(id)
  );
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (
  id: number
): UseQueryResult<CrmContactMetrics> =>
  useQuery({
    queryKey: crmContactQueryKeys.METRICS(id),
    queryFn: () => fetchContactMetrics(id)
  });

const fetchContactLookup = async (
  params: CrmContactFilterRequest
): Promise<CrmContactListResponse> => {
  const response = await authFetchV2.get(crmLookupEndpoints.CONTACT_LOOKUP, {
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
    enabled,
    refetchOnWindowFocus: false
  });

const fetchOwnerLookup = async (
  params: CrmOwnerLookupFilterRequest
): Promise<CrmOwnerListResponse> => {
  const response = await authFetch.get(crmLookupEndpoints.OWNER_LOOKUP, {
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
    enabled,
    refetchOnWindowFocus: false
  });
