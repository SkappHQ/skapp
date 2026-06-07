import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import useDebounce from "~community/common/hooks/useDebounce";
import { CONTACT_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/contactConstants";
import {
  CrmContactLookup,
  CrmDealFilterParams,
  CrmDealPaginatedResponse,
  CrmDealStageType,
  CrmOwner
} from "~community/crm/types/CommonTypes";

import { contactEndpoints, crmDealEndpoints } from "./utils/ApiEndpoints";
import { crmDealQueryKeys } from "./utils/QueryKeys";

interface CrmCreateDealPayload {
  name: string;
  stageId: number;
  contactId: number;
  ownerId: number;
  priority?: string;
  amount?: string;
  description?: string;
}

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

export const useGetCrmContacts = (
  searchKeyword: string,
  size: number
): UseQueryResult<CrmContactLookup[]> => {
  const debouncedSearch = useDebounce(searchKeyword, CONTACT_SEARCH_DEBOUNCE_DELAY);
  return useQuery({
    queryKey: [...crmDealQueryKeys.CONTACT_LOOKUP, debouncedSearch, size],
    queryFn: async (): Promise<CrmContactLookup[]> => {
      const response = await authFetch.get(contactEndpoints.CONTACT_LOOKUP, {
        params: { searchKeyword: debouncedSearch, size }
      });
      return response?.data?.results?.[0]?.items ?? [];
    }
  });
};

export const useGetCrmOwners = (
  searchKeyword: string,
  size: number
): UseQueryResult<CrmOwner[]> => {
  const debouncedSearch = useDebounce(searchKeyword, CONTACT_SEARCH_DEBOUNCE_DELAY);
  return useQuery({
    queryKey: [...crmDealQueryKeys.OWNER_LOOKUP, debouncedSearch, size],
    queryFn: async (): Promise<CrmOwner[]> => {
      const response = await authFetch.get(contactEndpoints.GET_OWNERS, {
        params: { searchKeyword: debouncedSearch, size }
      });
      return response?.data?.results?.[0]?.items ?? [];
    }
  });
};

export const useCreateDeal = (onSuccess: () => void, onError: () => void) => {
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
