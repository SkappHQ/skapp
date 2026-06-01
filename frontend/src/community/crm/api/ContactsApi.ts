import { type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { contactEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { contactQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  CreateContactPayload,
  CrmCompaniesResponseType,
  CrmOwnersResponseType
} from "~community/crm/types/CommonTypes";

interface CompaniesParams {
  page?: number;
  size?: number;
  searchKeyword?: string;
}

interface OwnersParams {
  page?: number;
  size?: number;
  searchKeyword?: string;
}

export const useGetCrmCompanies = (
  params: CompaniesParams = {}
): UseQueryResult<CrmCompaniesResponseType> => {
  const { page, size, searchKeyword } = params;

  return useQuery({
    queryKey: contactQueryKeys.CRM_COMPANIES(params),
    queryFn: async () => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: {
          page,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      });
      return response?.data?.results?.[0];
    }
  });
};

export const useGetCrmOwners = (
  params: OwnersParams = {}
): UseQueryResult<CrmOwnersResponseType> => {
  const { page, size, searchKeyword } = params;

  return useQuery({
    queryKey: contactQueryKeys.CRM_OWNERS(params),
    queryFn: async () => {
      const response = await authFetch.get(contactEndpoints.GET_OWNERS, {
        params: {
          page,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      });
      return response?.data?.results?.[0];
    }
  });
};

export const useCreateContact = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateContactPayload) => {
      const response = await authFetch.post(contactEndpoints.CREATE_CONTACT, payload);
      return response?.data?.results?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.GET_CONTACTS });
      onSuccess();
    },
    onError
  });
};
