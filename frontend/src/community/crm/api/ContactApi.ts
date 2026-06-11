import {
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  companyEndpoints,
  contactEndpoints
} from "~community/crm/api/utils/ApiEndpoints";
import {
  companyQueryKeys,
  contactQueryKeys
} from "~community/crm/api/utils/QueryKeys";
import {
  CrmCompaniesResponseType,
  CrmContactCreatePayload,
  CrmContactDetailResponseType,
  CrmContactLookup,
  CrmContactMetricsResponseType,
  CrmOwner,
  CrmOwnersResponseType
} from "~community/crm/types/CommonTypes";

interface ContactMetricsSearchParams {
  page: number;
  size: number;
  searchKeyword?: string;
  companyId?: number;
}

const fetchContactMetrics = async ({
  page,
  size,
  searchKeyword,
  companyId
}: ContactMetricsSearchParams): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: { page, size, searchKeyword, companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (
  searchKeyword: string,
  size: number,
  companyId?: number
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: contactQueryKeys.GET_CONTACT_DATA_BY_SEARCH(
      searchKeyword,
      companyId
    ),
    queryFn: ({ pageParam }) =>
      fetchContactMetrics({
        page: pageParam,
        size,
        searchKeyword,
        companyId
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    }
  });
};

export const useGetCrmCompanies = (size: number) => {
  return useQuery({
    queryKey: companyQueryKeys.CRM_COMPANIES(size),
    queryFn: async (): Promise<CrmCompaniesResponseType> => {
      const response = await authFetch.get(companyEndpoints.GET_COMPANIES, {
        params: { size }
      });
      return response?.data?.results?.[0];
    }
  });
};

const createNewContact = async (contactDetails: CrmContactCreatePayload) => {
  const response = await authFetch.post(
    contactEndpoints.CREATE_CONTACT,
    contactDetails
  );
  return response?.data?.results?.[0];
};

export const useCreateNewContact = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewContact,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.GET_CONTACT_DATA
      });
      onSuccess();
    },
    onError: onError
  });
};

const fetchCompanyLookup = async (
  searchKeyword: string,
  size: number
): Promise<CrmCompaniesResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
    params: { searchKeyword, size }
  });
  return response?.data?.results?.[0];
};

export const useGetCompanyLookup = (searchKeyword: string, size: number) => {
  return useQuery({
    queryKey: contactQueryKeys.COMPANY_LOOKUP(searchKeyword),
    queryFn: () => fetchCompanyLookup(searchKeyword, size)
  });
};

const fetchOwnerLookup = async (
  searchKeyword: string,
  size: number
): Promise<CrmOwnersResponseType> => {
  const response = await authFetch.get(contactEndpoints.OWNER_LOOKUP, {
    params: { searchKeyword, size }
  });
  return response?.data?.results?.[0];
};

export const useGetOwnerLookup = (
  searchKeyword: string,
  size: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: contactQueryKeys.OWNERS_LOOKUP(searchKeyword),
    queryFn: () => fetchOwnerLookup(searchKeyword, size),
    enabled
  });
};

export const useGetCrmContacts = (
  searchKeyword: string,
  size: number,
  enabled: boolean = true
): UseQueryResult<CrmContactLookup[]> => {
  return useQuery({
    queryKey: contactQueryKeys.CONTACT_LOOKUP(searchKeyword, size),
    queryFn: async (): Promise<CrmContactLookup[]> => {
      const response = await authFetch.get(contactEndpoints.CONTACT_LOOKUP, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    },
    enabled
  });
};

export const useGetCrmOwners = (
  searchKeyword: string,
  size: number,
  enabled: boolean = true
): UseQueryResult<CrmOwner[]> => {
  return useQuery({
    queryKey: contactQueryKeys.OWNER_LOOKUP(searchKeyword, size),
    queryFn: async (): Promise<CrmOwner[]> => {
      const response = await authFetch.get(contactEndpoints.OWNER_LOOKUP, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    },
    enabled
  });
};

const fetchContactById = async (
  id: number
): Promise<CrmContactDetailResponseType> => {
  const response = await authFetch.get(contactEndpoints.CONTACT_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetContactById = (
  id: number
): UseQueryResult<CrmContactDetailResponseType> => {
  return useQuery({
    queryKey: contactQueryKeys.CONTACT_BY_ID(id),
    queryFn: () => fetchContactById(id),
    refetchOnWindowFocus: false
  });
};
