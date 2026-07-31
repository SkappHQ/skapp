import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { businessUnitEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { businessUnitQueryKeys } from "~community/common/api/utils/QueryKeys";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import authFetch from "~community/common/utils/axiosInterceptor";

const getBusinessUnits = async (): Promise<BusinessUnit[]> => {
  const response = await authFetch.get(
    businessUnitEndpoints.GET_BUSINESS_UNITS
  );
  return response.data.results;
};

export const useGetBusinessUnits = (): UseQueryResult<BusinessUnit[]> => {
  return useQuery({
    queryKey: businessUnitQueryKeys.ALL,
    queryFn: getBusinessUnits
  });
};
