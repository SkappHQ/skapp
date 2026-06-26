import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rejects } from "assert";
import { AxiosResponse } from "axios";

import { timeConfigurationEndPoints } from "~community/common/api/utils/ApiEndpoints";
import { daysTypes } from "~community/common/constants/stringConstants";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  DayAvailability,
  DefaultDayCapacityType
} from "~community/configurations/types/TimeConfigurationsTypes";

import { timeConfigurationQueryKeys } from "./utils/QueryKeys";

const getDefaultCapacity = async (): Promise<DefaultDayCapacityType[]> => {
  const response = await authFetch.get(
    timeConfigurationEndPoints.GET_DEFAULT_CAPACITY()
  );
  return response?.data?.results;
};

const getConfigIsRemovable = async (
  params: daysTypes[]
): Promise<DayAvailability[][]> => {
  const queryString = params
    .map((day) => `days=${encodeURIComponent(day)}`)
    .join("&");
  const response = await authFetch.get(
    `${timeConfigurationEndPoints.GET_CONFIG_IS_REMOVABLE()}?${queryString}`
  );
  return response?.data?.results;
};

export const useGetConfigIsRemovable = (params: daysTypes[]) => {
  return useQuery({
    queryKey: [timeConfigurationQueryKeys.CONFIG_IS_REMOVEVABLE, params],
    queryFn: () => getConfigIsRemovable(params),
    enabled: params.length > 0
  });
};

const updateDefaultCapacity = async (
  payload: DefaultDayCapacityType[]
): Promise<AxiosResponse> => {
  const response = await authFetch.patch(
    timeConfigurationEndPoints.GET_DEFAULT_CAPACITY(),
    {
      dayCapacities: payload
    }
  );
  return response;
};

export const useDefaultCapacity = () => {
  return useQuery({
    queryKey: timeConfigurationQueryKeys.TIME_CONFIGURATIONS,
    queryFn: () => getDefaultCapacity(),
    enabled: true
  });
};

export const useHandleUpdateDefaultCapacity = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDefaultCapacity,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: timeConfigurationQueryKeys.TIME_CONFIGURATIONS
        })
        .catch(rejects);
      onSuccess();
    },
    onError
  });
};
