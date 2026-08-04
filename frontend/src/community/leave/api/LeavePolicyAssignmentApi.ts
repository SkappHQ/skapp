import {
  UseMutationResult,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import {
  leaveEntitlementQueryKeys,
  leavePolicyQueryKeys
} from "~community/leave/api/utils/QueryKeys";
import {
  BulkAssignPolicyApiResponse,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";

const bulkAssignLeavePolicies = (
  payload: BulkAssignPolicyPayload
): Promise<AxiosResponse<BulkAssignPolicyApiResponse>> =>
  authFetch.post<BulkAssignPolicyApiResponse>(
    leavePolicyEndPoints.BULK_ASSIGN_LEAVE_POLICIES,
    payload
  );

export const useBulkAssignLeavePolicies = (
  onSuccess: (response: BulkAssignPolicyResponse) => void,
  onError: () => void
): UseMutationResult<
  AxiosResponse<BulkAssignPolicyApiResponse>,
  AxiosError,
  BulkAssignPolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAssignLeavePolicies,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENTS()
      });

      onSuccess(response.data.results[0]);
    },
    onError
  });
};
