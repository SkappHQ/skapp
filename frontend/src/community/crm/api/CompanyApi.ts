import {
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import useDebounce from "~community/common/hooks/useDebounce";
import authFetch from "~community/common/utils/axiosInterceptor";
import { COMPANY_NAME_DEBOUNCE_DELAY } from "~community/crm/constants/companyConstants";

import {
  CompanyLookup,
  CrmCompanyCreatePayload,
  EditCompanyPayload
} from "../types/CommonTypes";
import { companyEndpoints, contactEndpoints } from "./utils/ApiEndpoints";
import { companyQueryKeys } from "./utils/QueryKeys";

interface CompanyMetricSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
}

const fetchCompanyMetrics = async ({
  page,
  size,
  searchKeyword
}: CompanyMetricSearchParams) => {
  const response = await authFetch.get(companyEndpoints.GET_COMPANY_METRICS, {
    params: {
      page,
      size,
      searchKeyword
    }
  });
  return response?.data?.results?.[0];
};

export const useGetCompanyMetrics = (searchKeyword: string, limit: number) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: companyQueryKeys.GET_COMPANY_DATA_BY_SEARCH(searchKeyword, limit),
    queryFn: ({ pageParam }) =>
      fetchCompanyMetrics({
        page: pageParam,
        size: limit,
        searchKeyword
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage + 1 >= lastPage.totalPages) return undefined;
      return lastPage.currentPage + 1;
    }
  });
};

export const useGetCompanyLookup = (
  searchKeyword: string,
  size: number
): UseQueryResult<CompanyLookup[]> => {
  const debouncedSearch = useDebounce(
    searchKeyword,
    COMPANY_NAME_DEBOUNCE_DELAY
  );
  return useQuery({
    queryKey: [...companyQueryKeys.COMPANY_LOOKUP, debouncedSearch],
    queryFn: async (): Promise<CompanyLookup[]> => {
      const response = await authFetch.get(contactEndpoints.GET_COMPANIES, {
        params: { searchKeyword: debouncedSearch, size }
      });
      return response?.data?.results?.[0]?.items ?? [];
    }
  });
};

const createNewCompany = async (companyDetails: CrmCompanyCreatePayload) => {
  const response = await authFetch.post(
    companyEndpoints.CREATE_COMPANY,
    companyDetails
  );
  return response?.data?.results?.[0];
};

export const useCreateNewCompany = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKeys.GET_COMPANY_DATA
      });
      onSuccess();
    },
    onError: onError
  });
};

export const useCheckCompanyNameExists = (
  name: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...companyQueryKeys.CHECK_COMPANY_NAME_EXISTS, name],
    queryFn: async () => {
      const response = await authFetch.get(
        companyEndpoints.CHECK_COMPANY_NAME_EXISTS(name)
      );
      return response?.data?.results?.[0];
    },
    enabled
  });
};

const editCompany = async ({ id, ...companyDetails }: EditCompanyPayload) => {
  const response = await authFetch.patch(
    companyEndpoints.EDIT_COMPANY(id),
    companyDetails
  );
  return response?.data?.results?.[0];
};

export const useEditCompany = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKeys.GET_COMPANY_DATA
      });
      onSuccess();
    },
    onError: onError
  });
};
