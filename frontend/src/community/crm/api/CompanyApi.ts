import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import {
  CrmCompanyCreatePayload,
  CrmCompanyResponseType,
  CrmCompanyTableDataResponseType
} from "../types/CommonTypes";
import { companyEndpoints } from "./utils/ApiEndpoints";
import { companyQueryKeys } from "./utils/QueryKeys";

interface GetAllCompaniesParams {
  page?: number;
  size?: number;
  searchKeyword?: string;
}

const fetchCompanies = async ({
  page,
  size,
  searchKeyword
}: GetAllCompaniesParams) => {
  try {
    const response = await authFetch.get(companyEndpoints.GET_ALL_COMPANIES, {
      params: {
        page,
        size,
        ...(searchKeyword ? { searchKeyword } : {})
      }
    });
    return response?.data as CrmCompanyResponseType;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

const fetchCompanyTableData = async ({
  page,
  size,
  searchKeyword
}: GetAllCompaniesParams) => {
  try {
    const response = await authFetch.get(
      companyEndpoints.GET_COMPANY_TABLE_DATA,
      {
        params: {
          page,
          size,
          ...(searchKeyword ? { searchKeyword } : {})
        }
      }
    );
    return response?.data as CrmCompanyTableDataResponseType;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

export const useGetAllCompanies = (
  searchKeyword: string,
  limit: number = 8
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: companyQueryKeys.GET_COMPANY_TABLE_DATA_BY_SEARCH(
      searchKeyword,
      limit
    ),
    queryFn: ({ pageParam }) =>
      fetchCompanies({
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

export const useGetCompanyTableData = (
  searchKeyword: string,
  limit: number = 8
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: companyQueryKeys.GET_COMPANY_TABLE_DATA_BY_SEARCH(
      searchKeyword,
      limit
    ),
    queryFn: ({ pageParam }) =>
      fetchCompanyTableData({
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

const createNewCompany = async (companyDetails: CrmCompanyCreatePayload) => {
  const response = await authFetch.post(
    companyEndpoints.CREATE_COMPANY,
    companyDetails
  );
  return response.data.results[0];
};

export const useCreateNewCompany = (
  onSuccess: () => void,
  onError: (messageKey: string) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewCompany,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: companyQueryKeys.GET_COMPANY_TABLE_DATA
        })
        .catch(() => {});
      onSuccess();
    },
    onError: (error: any) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

export const useCheckCompanyNameExists = (name: string) => {
  return useQuery({
    queryKey: [...companyQueryKeys.CHECK_COMPANY_NAME_EXISTS, name],
    queryFn: async () => {
      const response = await authFetch.get(
        companyEndpoints.CHECK_COMPANY_NAME_EXISTS(name)
      );
      return response?.data?.results[0] as boolean;
    },
    enabled: false
  });
};
