import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import { DOMAIN_SEARCH_LIMIT } from "../constants/commonConstants";
import {
  CrmCompanyCreatePayload,
  CrmCompanyDomainSearchResponseType,
  CrmCompletedTaskResponseType,
  CrmContactMetricsResponseType,
  CrmDealPaginatedResponse,
  CrmTaskResponseType,
  EditCompanyPayload
} from "../types/CommonTypes";
import {
  companyEndpoints,
  contactEndpoints,
  crmDealEndpoints,
  taskEndpoints
} from "./utils/ApiEndpoints";
import {
  companyQueryKeys,
  contactQueryKeys,
  crmDealQueryKeys,
  taskQueryKeys
} from "./utils/QueryKeys";

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
    },
    refetchOnWindowFocus: false
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

const deleteCompany = async (id: number) => {
  const response = await authFetch.delete(companyEndpoints.DELETE_COMPANY(id));
  return response?.data?.results?.[0];
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
      onSuccess();
    },
    onError: onError
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

const fetchOpenTasksByCompany = async (
  companyId: number
): Promise<CrmTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_TASKS, {
    params: { companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetOpenTasksByCompany = (
  companyId: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_OPEN_TASKS_BY_COMPANY(companyId),
    queryFn: () => fetchOpenTasksByCompany(companyId),
    enabled
  });
};

const fetchCompletedTasksByCompany = async (
  companyId: number
): Promise<CrmCompletedTaskResponseType> => {
  const response = await authFetch.get(taskEndpoints.GET_COMPLETED_TASKS, {
    params: { companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetCompletedTasksByCompany = (
  companyId: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: taskQueryKeys.GET_COMPLETED_TASKS_BY_COMPANY(companyId),
    queryFn: () => fetchCompletedTasksByCompany(companyId),
    enabled
  });
};

const fetchDealsByCompany = async (
  companyId: number
): Promise<CrmDealPaginatedResponse> => {
  const response = await authFetch.get(crmDealEndpoints.GET_DEALS, {
    params: { companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetDealsByCompany = (companyId: number, enabled: boolean) => {
  return useQuery({
    queryKey: crmDealQueryKeys.GET_DEALS_BY_COMPANY(companyId),
    queryFn: () => fetchDealsByCompany(companyId),
    enabled
  });
};

const fetchContactsByCompany = async (
  companyId: number
): Promise<CrmContactMetricsResponseType> => {
  const response = await authFetch.get(contactEndpoints.GET_CONTACT_METRICS, {
    params: { companyId }
  });
  return response?.data?.results?.[0];
};

export const useGetContactsByCompany = (
  companyId: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: contactQueryKeys.GET_CONTACTS_BY_COMPANY(companyId),
    queryFn: () => fetchContactsByCompany(companyId),
    enabled
  });
};
