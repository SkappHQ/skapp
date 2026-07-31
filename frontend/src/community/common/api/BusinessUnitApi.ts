import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import { businessUnitEndpoints } from "~community/common/api/utils/ApiEndpoints";
import { businessUnitQueryKeys } from "~community/common/api/utils/QueryKeys";
import {
  BusinessUnit,
  BusinessUnitRequestPayload,
  BusinessUnitUpdateVariables
} from "~community/common/types/BusinessUnitTypes";
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

const createBusinessUnit = (
  payload: BusinessUnitRequestPayload
): Promise<AxiosResponse<BusinessUnit>> =>
  authFetch.post(businessUnitEndpoints.CREATE_BUSINESS_UNIT, payload);

export const useCreateBusinessUnit = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<BusinessUnit>,
  AxiosError,
  BusinessUnitRequestPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusinessUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessUnitQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const updateBusinessUnit = ({
  id,
  payload
}: BusinessUnitUpdateVariables): Promise<AxiosResponse<BusinessUnit>> =>
  authFetch.patch(businessUnitEndpoints.UPDATE_BUSINESS_UNIT(id), payload);

export const useUpdateBusinessUnit = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<BusinessUnit>,
  AxiosError,
  BusinessUnitUpdateVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessUnitQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
