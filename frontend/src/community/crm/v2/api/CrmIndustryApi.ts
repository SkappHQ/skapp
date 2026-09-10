import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { crmIndustryEndpointsV2 } from "~community/crm/v2/api/utils/ApiEndpoints";
import { CrmIndustryEntity } from "~community/crm/v2/types/CrmCommonTypes";

const createIndustry = async (name: string): Promise<CrmIndustryEntity> => {
  const response = await authFetchV2.post(
    crmIndustryEndpointsV2.CREATE_INDUSTRY,
    { name }
  );
  return response?.data?.results?.[0];
};

export const useCreateIndustry = (
  onSuccess: (industry: CrmIndustryEntity) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<CrmIndustryEntity, AxiosError, string> =>
  useMutation({
    mutationFn: createIndustry,
    onSuccess,
    onError
  });
