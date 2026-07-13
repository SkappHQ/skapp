import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leavePolicyQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  AddLeavePolicyPayload,
  PolicyLeaveTypeType
} from "~community/leave/types/LeavePolicyTypes";

export const useGetPolicyLeaveTypes = (): UseQueryResult<
  PolicyLeaveTypeType[]
> => {
  return useQuery({
    queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES(),
    queryFn: () => authFetch.get(leavePolicyEndPoints.GET_POLICY_LEAVE_TYPES),
    select: (data) => data?.data?.results ?? []
  });
};

export const useAddLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<unknown, AxiosError, AddLeavePolicyPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leavePolicy: AddLeavePolicyPayload) =>
      authFetch.post(leavePolicyEndPoints.ADD_LEAVE_POLICY, leavePolicy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
