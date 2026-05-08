import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import { WorkLocationRequestPayload } from "~community/configurations/types/WorkLocationTypes";

import { workLocationEndpoints } from "~community/configurations/api/utils/ApiEndpoints";
import { workLocationQueryKeys } from "./utils/QueryKeys";

export const useGetWorkLocations = (
  search: string,
  page: number,
  size: number
) => {
  return useQuery({
    queryKey: workLocationQueryKeys.GET_WORK_LOCATIONS(search, page, size),
    queryFn: async () => {
      const response = await authFetch.get(
        workLocationEndpoints.GET_WORK_LOCATIONS(search, page, size)
      );
      return response.data.results[0];
    },
  });
};

export const useGetWorkLocationById = (id: number) => {
  return useQuery({
    queryKey: workLocationQueryKeys.GET_WORK_LOCATION_BY_ID(id),
    queryFn: async () => {
      const response = await authFetch.get(
        workLocationEndpoints.GET_WORK_LOCATION_BY_ID(id)
      );
      return response.data.results[0];
    },
  });
};

const createWorkLocationFn = async (data: WorkLocationRequestPayload) => {
  const response = await authFetch.post(
    workLocationEndpoints.CREATE_WORK_LOCATION,
    data
  );
  return response.data;
};

export const useCreateWorkLocation = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkLocationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workLocationQueryKeys.ALL
      });
      onSuccess();
    },
    onError
  });
};

const updateWorkLocationFn = async ({
  id,
  data
}: {
  id: number;
  data: WorkLocationRequestPayload;
}) => {
  const response = await authFetch.patch(
    workLocationEndpoints.UPDATE_WORK_LOCATION(id),
    data
  );
  return response.data;
};

export const useUpdateWorkLocation = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkLocationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workLocationQueryKeys.ALL
      });
      onSuccess();
    },
    onError
  });
};

const deleteWorkLocationFn = async (id: number) => {
  const response = await authFetch.delete(
    workLocationEndpoints.DELETE_WORK_LOCATION(id)
  );
  return response.data;
};

export const useDeleteWorkLocation = (
  onSuccess: () => void,
  onError: (error: Error) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkLocationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workLocationQueryKeys.ALL
      });
      onSuccess();
    },
    onError
  });
};
