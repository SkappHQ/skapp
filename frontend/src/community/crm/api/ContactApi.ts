import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { contactEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { contactQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CrmCompaniesResponseType,
  CrmContactEditPayload,
  CrmContactMetricsResponseType,
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
    queryKey: contactQueryKeys.CRM_COMPANIES,
    queryFn: async (): Promise<CrmCompaniesResponseType> => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: { size }
      });
      return response?.data?.results?.[0];
    }
  });
};

export const useGetCompanyLookup = (searchKeyword: string, size: number) => {
  return useQuery({
    queryKey: contactQueryKeys.COMPANY_LOOKUP(searchKeyword),
    queryFn: async (): Promise<CrmCompaniesResponseType> => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    }
  });
};

export const useGetOwnerLookup = (
  searchKeyword: string,
  size: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: contactQueryKeys.OWNER_LOOKUP(searchKeyword),
    queryFn: async (): Promise<CrmOwnersResponseType> => {
      const response = await authFetch.get(contactEndpoints.GET_OWNER_LOOKUP, {
        params: { searchKeyword, size }
      });
      return response?.data?.results?.[0];
    },
    enabled
  });
};

const editContact = async ({
  id,
  ...contactDetails
}: CrmContactEditPayload) => {
  const response = await authFetch.patch(
    contactEndpoints.EDIT_CONTACT(id),
    contactDetails
  );
  return response?.data?.results?.[0];
};

export const useEditContact = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editContact,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contactQueryKeys.GET_CONTACT_DATA
      });
      onSuccess();
    },
    onError: onError
  });
};

export const useCheckContactEmailExists = (
  email: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...contactQueryKeys.CHECK_CONTACT_EMAIL_EXISTS, email],
    queryFn: async () => {
      const response = await authFetch.get(
        contactEndpoints.CHECK_CONTACT_EMAIL_EXISTS(email)
      );
      return response?.data?.results?.[0];
    },
    enabled
  });
};
