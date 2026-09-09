import {
  UseMutationResult,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { authFetchV2 } from "~community/common/utils/axiosInterceptor";
import { crmIndustryEndpointsV2 } from "~community/crm/v2/api/utils/ApiEndpoints";
import { crmBoardQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import {
  CrmIndustryCreateRequest,
  CrmIndustryCreateResponse
} from "~community/crm/v2/types/CrmTypes";

const createIndustry = async (
  payload: CrmIndustryCreateRequest
): Promise<CrmIndustryCreateResponse> => {
  const response = await authFetchV2.post(
    crmIndustryEndpointsV2.CREATE_INDUSTRY,
    payload
  );
  return response?.data?.results?.[0];
};

export const useCreateIndustry = (
  onSuccess: (industry: CrmIndustryCreateResponse) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  CrmIndustryCreateResponse,
  AxiosError,
  CrmIndustryCreateRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIndustry,
    onSuccess: (createdIndustry) => {
      // The industry list is served by board init-data, so that is what has to be
      // refetched for the new industry to reach every other consumer of the store.
      queryClient.invalidateQueries({
        queryKey: crmBoardQueryKeys.BOARD_INIT_DATA
      });
      onSuccess(createdIndustry);
    },
    onError
  });
};
