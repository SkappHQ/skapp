import {
  type UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmQueryKeys } from "~community/crm/api/utils/QueryKeys";
import {
  ContactDeal,
  ContactDetail,
  ContactMetrics,
  ContactsListParams,
  ContactTask,
  CreateContactPayload,
  CrmCompaniesResponseType,
  CrmContactsListResponseType,
  CrmOwnersResponseType,
  UpdateContactPayload
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

// Get Contacts List
export const useGetCrmContacts = (
  params: ContactsListParams = {}
): UseQueryResult<CrmContactsListResponseType> => {
  const {
    page = 0,
    size = 10,
    sortKey = "DEAL_VALUE",
    sortOrder = "DESC",
    searchKeyword,
    companyIds
  } = params;

  return useQuery({
    queryKey: crmQueryKeys.CRM_CONTACTS(params),
    queryFn: () =>
      authFetch.get(crmEndpoints.GET_CONTACTS, {
        params: {
          page,
          size,
          sortKey,
          sortOrder,
          ...(searchKeyword ? { searchKeyword } : {}),
          ...(companyIds ? { companyIds } : {})
        }
      }),
    select: (data) => data?.data?.results?.[0] as CrmContactsListResponseType
  });
};

// Get Contacts List with Infinite Scroll
export const useGetCrmContactsInfinite = (
  params: Omit<ContactsListParams, "page"> = {}
) => {
  const {
    size = 10,
    sortKey = "DEAL_VALUE",
    sortOrder = "DESC",
    searchKeyword,
    companyIds
  } = params;

  return useInfiniteQuery({
    queryKey: crmQueryKeys.CRM_CONTACTS({ ...params, page: "infinite" }),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await authFetch.get(crmEndpoints.GET_CONTACTS, {
        params: {
          page: pageParam,
          size,
          sortKey,
          sortOrder,
          ...(searchKeyword ? { searchKeyword } : {}),
          ...(companyIds ? { companyIds } : {})
        }
      });
      return response?.data?.results?.[0] as CrmContactsListResponseType;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const hasMore = lastPage.currentPage < lastPage.totalPages - 1;
      return hasMore ? lastPage.currentPage + 1 : undefined;
    }
  });
};

// Get Contact by ID
export const useGetCrmContactById = (
  id: number,
  enabled = true
): UseQueryResult<ContactDetail> => {
  return useQuery({
    queryKey: crmQueryKeys.CRM_CONTACT_BY_ID(id),
    queryFn: () => authFetch.get(crmEndpoints.GET_CONTACT_BY_ID(id)),
    select: (data) => data?.data?.results?.[0] as ContactDetail,
    enabled: enabled && id > 0
  });
};

// Get Contact Metrics
export const useGetCrmContactMetrics = (
  id: number,
  enabled = true
): UseQueryResult<ContactMetrics> => {
  return useQuery({
    queryKey: crmQueryKeys.CRM_CONTACT_METRICS(id),
    queryFn: () => authFetch.get(crmEndpoints.GET_CONTACT_METRICS(id)),
    select: (data) => data?.data?.results?.[0] as ContactMetrics,
    enabled: enabled && id > 0
  });
};

// Get Contact Deals
export const useGetCrmContactDeals = (
  contactId: number,
  enabled = true
): UseQueryResult<ContactDeal[]> => {
  return useQuery({
    queryKey: crmQueryKeys.CRM_CONTACT_DEALS(contactId),
    queryFn: () => authFetch.get(crmEndpoints.GET_CONTACT_DEALS(contactId)),
    select: (data) => (data?.data?.results ?? []) as ContactDeal[],
    enabled: enabled && contactId > 0
  });
};

// Get Contact Tasks
export const useGetCrmContactTasks = (
  contactId: number,
  enabled = true
): UseQueryResult<ContactTask[]> => {
  return useQuery({
    queryKey: crmQueryKeys.CRM_CONTACT_TASKS(contactId),
    queryFn: () => authFetch.get(crmEndpoints.GET_CONTACT_TASKS(contactId)),
    select: (data) => (data?.data?.results ?? []) as ContactTask[],
    enabled: enabled && contactId > 0
  });
};

// Get Companies Lookup
export const useGetCrmCompanies = (
  params: CompaniesParams = {}
): UseQueryResult<CrmCompaniesResponseType> => {
  const { page = 0, size = 100, searchKeyword } = params;

  return useQuery({
    queryKey: crmQueryKeys.CRM_COMPANIES(params),
    queryFn: () =>
      authFetch.get(crmEndpoints.GET_COMPANIES, {
        params: {
          page,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      }),
    select: (data) => data?.data?.results?.[0] as CrmCompaniesResponseType
  });
};

// Get Owners
export const useGetCrmOwners = (
  params: OwnersParams = {}
): UseQueryResult<CrmOwnersResponseType> => {
  const { page = 0, size = 100, searchKeyword } = params;

  return useQuery({
    queryKey: crmQueryKeys.CRM_OWNERS(params),
    queryFn: () =>
      authFetch.get(crmEndpoints.GET_OWNERS, {
        params: {
          page,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      }),
    select: (data) => data?.data?.results?.[0] as CrmOwnersResponseType
  });
};

// Create Contact
export const useCreateContact = ({
  onSuccess,
  onError
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactPayload) =>
      authFetch.post(crmEndpoints.CREATE_CONTACT, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      onSuccess();
    },
    onError: (error: AxiosError<{ message?: string; results?: Array<{ message: string }> }>) => {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.results?.[0]?.message ??
        "Failed to create contact. Please try again.";
      onError(message);
    }
  });
};

// Update Contact
export const useUpdateContact = ({
  onSuccess,
  onError
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactPayload }) =>
      authFetch.put(crmEndpoints.UPDATE_CONTACT(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      onSuccess();
    },
    onError: (error: AxiosError<{ message?: string; results?: Array<{ message: string }> }>) => {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.results?.[0]?.message ??
        "Failed to update contact. Please try again.";
      onError(message);
    }
  });
};

// Delete Contact
export const useDeleteContact = ({
  onSuccess,
  onError
}: {
  onSuccess: () => void;
  onError: (message: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authFetch.patch(crmEndpoints.DELETE_CONTACT(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      onSuccess();
    },
    onError: (error: AxiosError<{ message?: string; results?: Array<{ message: string }> }>) => {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.results?.[0]?.message ??
        "Failed to delete contact. Please try again.";
      onError(message);
    }
  });
};
