import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rejects } from "assert";

import authFetch from "~community/common/utils/axiosInterceptor";

import { CrmCompanyType, CreateCrmCompanyPayload } from "../types/CrmCompanyTypes";
import { companyEndpoints } from "./utils/ApiEndpoints";
import { companyQueryKeys } from "./utils/QueryKeys";

export const useGetAllCompanies = (searchTerm: string = "") => {
  return useQuery({
    queryKey: [...companyQueryKeys.GET_COMPANY_TABLE_DATA, searchTerm],
    queryFn: async () => {
      const response = await authFetch.get(
        companyEndpoints.GET_ALL_COMPANIES
      );
      return response?.data?.results as CrmCompanyType[];
    }
  });
};

const createNewCompany = async (companyDetails: CreateCrmCompanyPayload) => {
  try {
    const response = await authFetch.post(
      companyEndpoints.CREATE_COMPANY,
      companyDetails
    );
    return response.data.results[0];
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
};

export const useCreateNewCompany = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewCompany,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: companyQueryKeys.GET_COMPANY_TABLE_DATA
        })
        .catch(() => {
          rejects;
        });
      onSuccess();
    },
    onError: onError
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
