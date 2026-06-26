import { useQuery } from "@tanstack/react-query";

import authFetch from "../utils/axiosInterceptor";
import { storageAvailabilityEndpoints } from "./utils/ApiEndpoints";
import { storageAvailabilityQueryKeys } from "./utils/QueryKeys";

export const useStorageAvailability = (
  isSessionDataAvailable: boolean = true
) => {
  return useQuery({
    queryKey: storageAvailabilityQueryKeys.GET_STORAGE_AVAILABILITY,
    queryFn: async () => {
      const response = await authFetch.get(
        storageAvailabilityEndpoints.GET_STORAGE_AVAILABILITY
      );
      return response.data.results[0];
    },
    enabled: isSessionDataAvailable
  });
};
