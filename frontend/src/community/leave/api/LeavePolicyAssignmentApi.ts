import {
  UseMutationResult,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

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

const bulkAssignLeavePolicies = async (
  payload: BulkAssignPolicyPayload
): Promise<BulkAssignPolicyResponse> => {
  const response = await authFetch.post<BulkAssignPolicyApiResponse>(
    leavePolicyEndPoints.BULK_ASSIGN_LEAVE_POLICIES,
    payload
  );
  return response.data.results[0];
};

export const useBulkAssignLeavePolicies = (): UseMutationResult<
  BulkAssignPolicyResponse,
  AxiosError,
  BulkAssignPolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAssignLeavePolicies,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENTS()
      });
    }
  });
};
