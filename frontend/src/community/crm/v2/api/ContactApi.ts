import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
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
import {
  CrmContactEntity,
  CrmContactMetrics
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmContactFilterRequest,
  CrmContactListResponse,
  CrmExistsResponse,
  CrmOwnerListResponse,
  CrmOwnerLookupFilterRequest
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

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

const fetchContactById = async (id: number): Promise<CrmContactEntity> => {
  const response = await authFetchV2.get(
    crmContactEndpoints.GET_CONTACT_BY_ID(id)
  );
  return response?.data?.results?.[0];
};

export const useGetContactById = (
  id: number
): UseQueryResult<CrmContactEntity> =>
  useQuery({
    queryKey: crmContactQueryKeys.DETAIL(id),
    queryFn: () => fetchContactById(id)
  });

const checkContactEmailExists = async (
  email: string
): Promise<CrmExistsResponse> => {
  const response = await authFetch.get(
    crmContactEndpoints.CHECK_CONTACT_EMAIL_EXISTS,
    { params: { email } }
  );
  return response?.data?.results?.[0];
};

export const useCheckContactEmailExists = (
  email: string,
  enabled?: boolean
): UseQueryResult<CrmExistsResponse> =>
  useQuery({
    queryKey: crmContactQueryKeys.EMAIL_EXISTS(email),
    queryFn: () => checkContactEmailExists(email),
    enabled
  });

const createContact = async (
  payload: CrmContactEntity
): Promise<CrmContactEntity> => {
  const response = await authFetchV2.post(
    crmContactEndpoints.CREATE_CONTACT,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateContact = (
  onSuccess: (contact: CrmContactEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmContactEntity, AxiosError, CrmContactEntity> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: (createdContact) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdContact);
    },
    onError
  });
};

const editContact = async (
  contact: CrmContactEntity
): Promise<CrmContactEntity> => {
  const { id, ...payload } = contact;
  const response = await authFetchV2.patch(
    crmContactEndpoints.EDIT_CONTACT(id!),
    payload
  );
  return response?.data?.results?.[0];
};

export const useEditContact = (
  onSuccess: (contact: CrmContactEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmContactEntity, AxiosError, CrmContactEntity> =>
  useMutation({
    mutationFn: editContact,
    onSuccess,
    onError
  });

const deleteContact = async (id: number): Promise<void> => {
  await authFetch.delete(crmContactEndpoints.DELETE_CONTACT(id));
};

export const useDeleteContact = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
