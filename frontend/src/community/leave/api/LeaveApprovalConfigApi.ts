import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leaveApprovalConfigEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leaveApprovalConfigQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  LeaveApprovalConfigResponse,
  LeaveApprovalConfigType
} from "~community/leave/types/LeaveApprovalConfigTypes";

const getLeaveApprovalConfig = async (): Promise<LeaveApprovalConfigType> => {
  const response = await authFetch.get<LeaveApprovalConfigResponse>(
    leaveApprovalConfigEndPoints.GET_LEAVE_APPROVAL_CONFIG
  );
  return response.data.results[0];
};

export const useGetLeaveApprovalConfig =
  (): UseQueryResult<LeaveApprovalConfigType> => {
    return useQuery({
      queryKey: leaveApprovalConfigQueryKeys.GET_LEAVE_APPROVAL_CONFIG,
      queryFn: getLeaveApprovalConfig
    });
  };

const updateLeaveApprovalConfig = (
  config: LeaveApprovalConfigType
): Promise<AxiosResponse<LeaveApprovalConfigResponse>> =>
  authFetch.patch<LeaveApprovalConfigResponse>(
    leaveApprovalConfigEndPoints.UPDATE_LEAVE_APPROVAL_CONFIG,
    config
  );

export const useUpdateLeaveApprovalConfig = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<LeaveApprovalConfigResponse>,
  AxiosError,
  LeaveApprovalConfigType
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeaveApprovalConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leaveApprovalConfigQueryKeys.GET_LEAVE_APPROVAL_CONFIG
      });
      onSuccess();
    },
    onError
  });
};
