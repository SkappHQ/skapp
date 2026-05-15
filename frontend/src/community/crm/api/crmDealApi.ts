import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CrmCompanyType,
  CrmContactType,
  CrmDealCreateRequestType,
  CrmDealPaginatedResponseType,
  CrmDealStageType,
  CrmPriorityType
} from "~community/crm/types/CommonTypes";

import {
  crmCompanyEndpoints,
  crmContactEndpoints,
  crmDealEndpoints
} from "./utils/ApiEndpoints";
import {
  MOCK_COMPANIES,
  MOCK_CONTACTS,
  MOCK_DEAL_STAGES,
  MOCK_PRIORITIES,
  filterAndPaginateMockDeals
} from "./utils/mockDealData";
import {
  crmCompanyQueryKeys,
  crmContactQueryKeys,
  crmDealQueryKeys
} from "./utils/QueryKeys";

export const useGetDealStages = (): UseQueryResult<CrmDealStageType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: async () => {
      try {
        const response = await authFetch.get(crmDealEndpoints.GET_DEAL_STAGES);
        const results = response?.data?.results ?? [];
        if (results.length > 0) return results as CrmDealStageType[];
      } catch {
        // fall through to mock data
      }
      return MOCK_DEAL_STAGES;
    },
    staleTime: 5 * 60 * 1000
  });
};

export const useGetPriorities = (): UseQueryResult<CrmPriorityType[]> => {
  return useQuery({
    queryKey: crmDealQueryKeys.PRIORITIES,
    queryFn: async () => {
      try {
        const response = await authFetch.get(crmDealEndpoints.GET_PRIORITIES);
        const results = response?.data?.results ?? [];
        if (results.length > 0) return results as CrmPriorityType[];
      } catch {
        // fall through to mock data
      }
      return MOCK_PRIORITIES;
    },
    staleTime: 5 * 60 * 1000
  });
};

export const useGetDeals = (
  page: number,
  size: number,
  sortOrder: string,
  sortKey: string,
  searchKeyword?: string,
  stageId?: number,
  priorityId?: number
): UseQueryResult<CrmDealPaginatedResponseType> => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEALS(
      page,
      size,
      sortOrder,
      sortKey,
      searchKeyword,
      stageId,
      priorityId
    ),
    queryFn: async () => {
      try {
        const response = await authFetch.get(
          crmDealEndpoints.GET_DEALS(
            page,
            size,
            sortOrder,
            sortKey,
            searchKeyword,
            stageId,
            priorityId
          )
        );
        const result = response?.data?.results as CrmDealPaginatedResponseType;
        if (result?.items) return result;
      } catch {
        // fall through to mock data
      }
      return filterAndPaginateMockDeals(
        page,
        size,
        sortOrder,
        searchKeyword,
        stageId,
        priorityId
      );
    }
  });
};

export const useGetDealsForKanban = (
  sortOrder: string,
  searchKeyword?: string,
  stageId?: number,
  priorityId?: number
): UseQueryResult<CrmDealPaginatedResponseType> => {
  const KANBAN_PAGE_SIZE = 500;
  return useQuery({
    queryKey: crmDealQueryKeys.DEALS(
      0,
      KANBAN_PAGE_SIZE,
      sortOrder,
      "CREATED_DATE",
      searchKeyword,
      stageId,
      priorityId
    ),
    queryFn: async () => {
      try {
        const response = await authFetch.get(
          crmDealEndpoints.GET_DEALS(
            0,
            KANBAN_PAGE_SIZE,
            sortOrder,
            "CREATED_DATE",
            searchKeyword,
            stageId,
            priorityId
          )
        );
        const result = response?.data?.results as CrmDealPaginatedResponseType;
        if (result?.items) return result;
      } catch {
        // fall through to mock data
      }
      return filterAndPaginateMockDeals(
        0,
        KANBAN_PAGE_SIZE,
        sortOrder,
        searchKeyword,
        stageId,
        priorityId
      );
    }
  });
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: (error: unknown) => void
): UseMutationResult<unknown, unknown, CrmDealCreateRequestType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CrmDealCreateRequestType) =>
      authFetch.post(crmDealEndpoints.CREATE_DEAL, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmDealQueryKeys.ALL_DEALS });
      onSuccess();
    },
    onError
  });
};

export const useGetCrmContacts = (
  searchKeyword?: string
): UseQueryResult<CrmContactType[]> => {
  return useQuery({
    queryKey: crmContactQueryKeys.LIST(searchKeyword),
    queryFn: async () => {
      try {
        const response = await authFetch.get(
          crmContactEndpoints.GET_CONTACTS(searchKeyword)
        );
        const results =
          response?.data?.results?.items ?? response?.data?.results ?? [];
        if (results.length > 0) return results as CrmContactType[];
      } catch {
        // fall through to mock data
      }
      if (!searchKeyword) return MOCK_CONTACTS;
      const kw = searchKeyword.toLowerCase();
      return MOCK_CONTACTS.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.email.toLowerCase().includes(kw)
      );
    },
    staleTime: 2 * 60 * 1000
  });
};

export const useGetCrmCompanies = (
  searchKeyword?: string
): UseQueryResult<CrmCompanyType[]> => {
  return useQuery({
    queryKey: crmCompanyQueryKeys.LIST(searchKeyword),
    queryFn: async () => {
      try {
        const response = await authFetch.get(
          crmCompanyEndpoints.GET_COMPANIES(searchKeyword)
        );
        const results =
          response?.data?.results?.items ?? response?.data?.results ?? [];
        if (results.length > 0) return results as CrmCompanyType[];
      } catch {
        // fall through to mock data
      }
      if (!searchKeyword) return MOCK_COMPANIES;
      const kw = searchKeyword.toLowerCase();
      return MOCK_COMPANIES.filter((c) =>
        c.name.toLowerCase().includes(kw)
      );
    },
    staleTime: 2 * 60 * 1000
  });
};

