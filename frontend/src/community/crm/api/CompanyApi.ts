import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

import { DOMAIN_SEARCH_LIMIT } from "../constants/commonConstants";
import {
  CrmCompany,
  CrmCompanyCreatePayload,
  CrmCompanyDomainSearchResponseType,
  CrmCompanyMetricsResponseType,
  CrmDealPaginatedResponse,
  EditCompanyPayload
} from "../types/CommonTypes";
import { companyEndpoints, crmDealEndpoints } from "./utils/ApiEndpoints";
import { companyQueryKeys, crmDealQueryKeys } from "./utils/QueryKeys";

interface CompanyMetricSearchParams {
  page: number;
  size: number;
  searchKeyword: string;
}
const fetchCompanyMetrics = async ({
  page,
  size,
  searchKeyword
}: CompanyMetricSearchParams): Promise<CrmCompanyMetricsResponseType> => {
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
    },
    refetchOnWindowFocus: false
  });
};

const createNewCompany = async (
  companyDetails: CrmCompanyCreatePayload
): Promise<CrmCompany> => {
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
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

export const useCheckCompanyNameExists = (name: string, enabled: boolean) => {
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

const editCompany = async ({
  id,
  ...companyDetails
}: EditCompanyPayload): Promise<CrmCompany> => {
  const response = await authFetch.patch(
    companyEndpoints.EDIT_COMPANY(id),
    companyDetails
  );
  return response?.data?.results?.[0];
};

export const useEditCompany = (
  onSuccess: (data: CrmCompany) => void,
  onError: () => void
) =>
  useMutation({
    mutationFn: editCompany,
    onSuccess,
    onError
  });

const deleteCompany = async (id: number): Promise<void> => {
  await authFetch.delete(companyEndpoints.DELETE_COMPANY(id));
};

export const useDeleteCompany = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyQueryKeys.GET_COMPANY_DATA
      });
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};

const fetchCompaniesByDomain = async (
  domain: string
): Promise<CrmCompanyDomainSearchResponseType> => {
  const response = await authFetch.get(
    companyEndpoints.SEARCH_COMPANIES_BY_DOMAIN,
    { params: { domain, limit: DOMAIN_SEARCH_LIMIT } }
  );
  return response?.data?.results?.[0];
};

export const useSearchCompaniesByDomain = (
  domain: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: companyQueryKeys.SEARCH_COMPANIES_BY_DOMAIN(domain),
    queryFn: () => fetchCompaniesByDomain(domain),
    enabled
  });
};

interface DealsByCompanySearchParams {
  page: number;
  size: number;
  companyId: number;
}

const fetchDealsByCompany = async ({
  page,
  size,
  companyId
}: DealsByCompanySearchParams): Promise<CrmDealPaginatedResponse> => {
  const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
    params: { page, size, companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetDealsByCompany = (
  companyId: number,
  size: number,
  enabled: boolean
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: crmDealQueryKeys.GET_DEALS_BY_COMPANY(companyId),
    queryFn: ({ pageParam }) =>
      fetchDealsByCompany({ page: pageParam, size, companyId }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
    enabled
  });
};
