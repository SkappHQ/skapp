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
import { crmCompanyEndpoints } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmCompanyQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import {
  CrmCompanyEntity,
  CrmCompanyMetrics
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmCompanyFilterRequest,
  CrmCompanyListResponse,
  CrmExistsResponse
} from "~community/crm/v2/types/CrmTypes";
import { crmLimitationQueryKeys } from "~enterprise/crm/api/utils/QueryKeys";

const fetchCompanies = async (
  params: CrmCompanyFilterRequest
): Promise<CrmCompanyListResponse> => {
  const response = await authFetchV2.get(crmCompanyEndpoints.GET_COMPANIES, {
    params
  });
  return response?.data?.results?.[0];
};

export const useGetCompaniesInfinite = (
  params: CrmCompanyFilterRequest
): UseInfiniteQueryResult<InfiniteData<CrmCompanyListResponse>, AxiosError> =>
  useInfiniteQuery({
    queryKey: crmCompanyQueryKeys.LIST(params),
    queryFn: ({ pageParam }) => fetchCompanies({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.currentPage + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    refetchOnWindowFocus: false
  });

const fetchCompanyById = async (id: number): Promise<CrmCompanyEntity> => {
  const response = await authFetch.get(
    crmCompanyEndpoints.GET_COMPANY_BY_ID(id)
  );
  return response?.data?.results?.[0];
};

export const useGetCompanyById = (
  id: number
): UseQueryResult<CrmCompanyEntity> =>
  useQuery({
    queryKey: crmCompanyQueryKeys.DETAIL(id),
    queryFn: () => fetchCompanyById(id)
  });

const fetchCompanyMetrics = async (id: number): Promise<CrmCompanyMetrics> => {
  const response = await authFetch.get(
    crmCompanyEndpoints.GET_COMPANY_METRICS(id)
  );
  return response?.data?.results?.[0];
};

export const useGetCompanyMetrics = (
  id: number
): UseQueryResult<CrmCompanyMetrics> =>
  useQuery({
    queryKey: crmCompanyQueryKeys.METRICS(id),
    queryFn: () => fetchCompanyMetrics(id)
  });

const checkCompanyNameExists = async (
  name: string
): Promise<CrmExistsResponse> => {
  const response = await authFetch.get(
    crmCompanyEndpoints.CHECK_COMPANY_NAME_EXISTS,
    { params: { name } }
  );
  return response?.data?.results?.[0];
};

export const useCheckCompanyNameExists = (
  name: string,
  enabled?: boolean
): UseQueryResult<CrmExistsResponse> =>
  useQuery({
    queryKey: crmCompanyQueryKeys.NAME_EXISTS(name),
    queryFn: () => checkCompanyNameExists(name),
    enabled
  });

const createCompany = async (
  payload: CrmCompanyEntity
): Promise<CrmCompanyEntity> => {
  const response = await authFetch.post(
    crmCompanyEndpoints.CREATE_COMPANY,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateCompany = (
  onSuccess: (company: CrmCompanyEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmCompanyEntity, AxiosError, CrmCompanyEntity> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: (createdCompany) => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess(createdCompany);
    },
    onError
  });
};

const editCompany = async (
  company: CrmCompanyEntity
): Promise<CrmCompanyEntity> => {
  const { id, ...payload } = company;
  const response = await authFetch.patch(
    crmCompanyEndpoints.EDIT_COMPANY(id!),
    payload
  );
  return response?.data?.results?.[0];
};

export const useEditCompany = (
  onSuccess: (company: CrmCompanyEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmCompanyEntity, AxiosError, CrmCompanyEntity> =>
  useMutation({
    mutationFn: editCompany,
    onSuccess,
    onError
  });

const deleteCompany = async (id: number): Promise<void> => {
  await authFetch.delete(crmCompanyEndpoints.DELETE_COMPANY(id));
};

export const useDeleteCompany = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<void, AxiosError, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: crmLimitationQueryKeys.GET_CRM_LIMITATION
      });
      onSuccess();
    },
    onError
  });
};
