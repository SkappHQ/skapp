import { UseQueryResult, useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { crmConfigurationEndpoints } from "~community/configurations/api/utils/ApiEndpoints";
import { crmConfigurationQueryKeys } from "~community/configurations/api/utils/QueryKeys";
import { CrmDealStageType } from "~community/crm/types/CommonTypes";

const fetchDealStages = async (): Promise<CrmDealStageType[]> => {
  const response = await authFetch.get(
    crmConfigurationEndpoints.GET_DEAL_STAGE
  );
  return response?.data?.results;
};

export const useGetDealStages = () => {
  return useQuery({
    queryKey: crmConfigurationQueryKeys.DEAL_STAGES,
    queryFn: fetchDealStages
  });
};
