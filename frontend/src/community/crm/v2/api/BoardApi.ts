import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmBoardEndpoints } from "~community/crm/api/utils/ApiEndpoints";
import { crmBoardQueryKeys } from "~community/crm/api/utils/QueryKeys";
import { CrmBoardInitDataResponse } from "~community/crm/v2/types/CrmTypes";

const fetchBoardInitData = async (): Promise<CrmBoardInitDataResponse> => {
  const response = await authFetch.get(crmBoardEndpoints.GET_BOARD_INIT_DATA);
  return response?.data?.results?.[0];
};

export const useGetBoardInitData = (
  enabled: boolean
): UseQueryResult<CrmBoardInitDataResponse> =>
  useQuery({
    queryKey: crmBoardQueryKeys.BOARD_INIT_DATA,
    queryFn: fetchBoardInitData,
    enabled
  });
