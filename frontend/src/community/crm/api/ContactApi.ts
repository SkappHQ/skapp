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
  contactQueryKeys,
  crmDealQueryKeys,
  taskQueryKeys
} from "~community/crm/api/utils/QueryKeys";
import {
  CrmCompaniesResponseType,
  CrmContact,
  CrmContactCreatePayload,
  CrmContactLookupResponseType,
  CrmContactMetricsResponseType,
  CrmExistsResponse,
  CrmOwner,
  CrmOwnersResponseType,
  EditContactPayload
} from "~community/crm/types/CommonTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

interface ContactMetricsSearchParams {
  page: number;
  size: number;
  searchKeyword?: string;
  companyId?: number | null;
}

const fetchContactMetrics = async ({
  page,
  size,
  searchKeyword,
  companyId
}: ContactMetricsSearchParams): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: {
      page,
      size,
      searchKeyword,
      ...(companyId != null && { companyId })
    }
  });
  return response?.data?.results?.[0];
};

export const useGetContactMetrics = (
  searchKeyword: string,
  size: number,
  companyId?: number | null,
  enabled?: boolean
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
    },
    refetchOnWindowFocus: false,
    enabled
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

const createNewContact = async (
  contactDetails: CrmContactCreatePayload
): Promise<CrmContact> => {
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
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const editContact = async ({
  id,
  ...payload
}: EditContactPayload): Promise<CrmContact> => {
  const response = await authFetch.patch(
    contactEndpoints.EDIT_CONTACT(id),
    payload
  );
  return response?.data?.results?.[0];
};

export const useEditContact = (
  onSuccess: (data: CrmContact) => void,
  onError: () => void
) =>
  useMutation({
    mutationFn: editContact,
    onSuccess,
    onError
  });

const checkContactEmailExists = async (
  email: string
): Promise<CrmExistsResponse> => {
  const response = await authFetch.get(
    contactEndpoints.CHECK_CONTACT_EMAIL_EXISTS,
    {
      params: { email }
    }
  );
  return response?.data?.results?.[0];
};

export const useCheckContactEmailExists = (
  email: string,
  enabled: boolean
): UseQueryResult<CrmExistsResponse> => {
  return useQuery({
    queryKey: contactQueryKeys.CHECK_CONTACT_EMAIL_EXISTS(email),
    queryFn: () => checkContactEmailExists(email),
    refetchOnWindowFocus: false,
    enabled
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
  enabled: boolean,
  dealId?: number | null
): UseQueryResult<CrmContactLookupResponseType> => {
  return useQuery({
    queryKey: contactQueryKeys.CONTACT_LOOKUP(searchKeyword, size, dealId),
    queryFn: async (): Promise<CrmContactLookupResponseType> => {
      const response = await authFetch.get(contactEndpoints.CONTACT_LOOKUP, {
        params: {
          searchKeyword,
          size,
          ...(dealId != null && { dealId })
        }
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

const fetchContactById = async (id: number): Promise<CrmContact> => {
  const response = await authFetch.get(contactEndpoints.CONTACT_BY_ID(id));
  return response?.data?.results?.[0];
};

export const useGetContactById = (
  id: number,
  enabled = true
): UseQueryResult<CrmContact> => {
  return useQuery({
    queryKey: contactQueryKeys.CONTACT_BY_ID(id),
    queryFn: () => fetchContactById(id),
    refetchOnWindowFocus: false,
    enabled
  });
};

const deleteContact = async (id: number): Promise<void> => {
  await authFetch.delete(contactEndpoints.DELETE_CONTACT(id));
};

export const useDeleteContact = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.GET_CONTACT_DATA
      });
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.GET_OPEN_TASKS });
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.GET_COMPLETED_TASKS
      });
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
