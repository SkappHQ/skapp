import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { workLocationEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { workLocationQueryKeys } from "~community/common/api/utils/QueryKeys";
import { WorkLocationType } from "~community/common/types/WorkLocationTypes";
import authFetch from "~community/common/utils/axiosInterceptor";

export const useGetAllWorkLocations = (): UseQueryResult<
  WorkLocationType[]
> => {
  return useQuery({
    queryKey: workLocationQueryKeys.ALL_WORK_LOCATIONS,
    queryFn: () =>
      authFetch.get(workLocationEndpoints.WORK_LOCATIONS, {
        params: { size: -1 }
      }),
    select: (data) => {
      return data?.data?.results?.[0]?.items ?? [];
    }
  });
};
