import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyAssignmentEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import {
  BulkAssignPolicyApiResponse,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";

const bulkAssignLeavePolicies = (
  payload: BulkAssignPolicyPayload
): Promise<AxiosResponse<BulkAssignPolicyApiResponse>> =>
  authFetch.post<BulkAssignPolicyApiResponse>(
    leavePolicyAssignmentEndPoints.BULK_ASSIGN_LEAVE_POLICIES,
    payload
  );

export const useBulkAssignLeavePolicies = (
  onSuccess: (response: BulkAssignPolicyResponse) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<BulkAssignPolicyApiResponse>,
  AxiosError,
  BulkAssignPolicyPayload
> => {
  return useMutation({
    mutationFn: bulkAssignLeavePolicies,
    onSuccess: (response) => {
      onSuccess(response.data.results[0]);
    },
    onError
  });
};
