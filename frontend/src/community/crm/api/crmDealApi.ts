import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import useDebounce from "~community/common/hooks/useDebounce";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  CompanyLookup,
  CrmContactLookup,
  CrmCreateDealPayload,
  CrmDealFilterParams,
  CrmDealPaginatedResponse,
  CrmDealStageType,
  CrmOwnerType
} from "~community/crm/types/CommonTypes";
import { contactEndpoints, crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

// Standard way to handle paginated API calls using react-query's useInfiniteQuery
export const useGetDealsInfinite = (
  params: CrmDealFilterParams
): UseInfiniteQueryResult<CrmDealPaginatedResponse> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS(params),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
        params: {
          page: pageParam,
          ...params
        }
      });
      return response?.data?.results?.[0] as CrmDealPaginatedResponse;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useGetDealStages = () => {
  return useQuery({
    queryKey: crmDealQueryKeys.DEAL_STAGES,
    queryFn: async (): Promise<CrmDealStageType[]> => {
      const response = await authFetch.get(crmDealEndpoints.DEAL_STAGES);
      return response?.data?.results ?? [];
    }
  });
};

interface LookupPageDto<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
}

export const useGetCrmContacts = (searchKeyword: string) => {
  const debouncedSearch = useDebounce(searchKeyword, 400);
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [...crmDealQueryKeys.CONTACT_LOOKUP, debouncedSearch],
    queryFn: async ({ pageParam = 0 }): Promise<LookupPageDto<CrmContactLookup>> => {
      const response = await authFetch.get(contactEndpoints.CONTACT_LOOKUP, {
        params: {
          page: pageParam,
          size: 10,
          ...(debouncedSearch && { searchKeyword: debouncedSearch })
        }
      });
      return response?.data?.results?.[0];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useGetCrmCompanies = (searchKeyword: string) => {
  const debouncedSearch = useDebounce(searchKeyword, 400);
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [...crmDealQueryKeys.COMPANY_LOOKUP, debouncedSearch],
    queryFn: async ({ pageParam = 0 }): Promise<LookupPageDto<CompanyLookup>> => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: {
          page: pageParam,
          size: 10,
          ...(debouncedSearch && { searchKeyword: debouncedSearch })
        }
      });
      return response?.data?.results?.[0];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useGetCrmOwners = (searchKeyword: string) => {
  const debouncedSearch = useDebounce(searchKeyword, 400);
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: [...crmDealQueryKeys.OWNER_LOOKUP, debouncedSearch],
    queryFn: async ({ pageParam = 0 }): Promise<LookupPageDto<CrmOwnerType>> => {
      const response = await authFetch.get(contactEndpoints.GET_OWNERS, {
        params: {
          page: pageParam,
          size: 10,
          ...(debouncedSearch && { searchKeyword: debouncedSearch })
        }
      });
      return response?.data?.results?.[0];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useCreateDeal = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CrmCreateDealPayload) => {
      const response = await authFetch.post(
        crmDealEndpoints.CREATE_DEAL,
        payload
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["crm-deals"] })
        .catch(() => undefined);
      onSuccess();
    },
    onError
  });
};
