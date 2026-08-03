import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { policyLeaveEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { policyLeaveQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  EmployeePolicyBalanceType,
  PolicyLeaveAvailabilityPayload,
  PolicyLeaveAvailabilityType,
  PolicyLeaveRequestPayload,
  PolicyLeaveRequestType
} from "~community/leave/types/PolicyLeaveTypes";

/**
 * My Leave Allocation cards for organizations running on leave policies. The response is
 * one entry per assigned policy — grouping by leave type is deliberately not done
 * anywhere in this flow.
 */
export const useGetMyPolicyBalances = (
  year: string,
  enabled = true
): UseQueryResult<EmployeePolicyBalanceType[]> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.MY_POLICY_BALANCES(year),
    queryFn: async () => {
      const response = await authFetch.get(
        policyLeaveEndPoints.GET_MY_POLICY_BALANCES(year)
      );
      return response.data.results as EmployeePolicyBalanceType[];
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

export const useGetMyPolicyLeaveRequests = (
  year: string,
  enabled = true
): UseQueryResult<PolicyLeaveRequestType[]> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS(year),
    queryFn: async () => {
      const response = await authFetch.get(
        policyLeaveEndPoints.GET_MY_POLICY_LEAVE_REQUESTS(year)
      );
      return response.data.results as PolicyLeaveRequestType[];
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

/**
 * Real-time balance check fired while the user edits dates. Failures come back on the
 * payload rather than as errors, so the modal can render them inline.
 */
export const useCheckPolicyLeaveAvailability = (
  onSuccess?: (data: PolicyLeaveAvailabilityType) => void
): UseMutationResult<
  PolicyLeaveAvailabilityType,
  ErrorResponse,
  PolicyLeaveAvailabilityPayload
> => {
  return useMutation({
    mutationFn: async (payload: PolicyLeaveAvailabilityPayload) => {
      const response = await authFetch.post(
        policyLeaveEndPoints.CHECK_POLICY_LEAVE_AVAILABILITY,
        payload
      );
      return response.data.results[0] as PolicyLeaveAvailabilityType;
    },
    onSuccess
  });
};

export const useApplyPolicyLeave = (
  year: string,
  onSuccess: (data: PolicyLeaveRequestType) => void,
  onError: (messageKey: string) => void
): UseMutationResult<
  PolicyLeaveRequestType,
  ErrorResponse,
  PolicyLeaveRequestPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PolicyLeaveRequestPayload) => {
      const response = await authFetch.post(
        policyLeaveEndPoints.APPLY_POLICY_LEAVE,
        payload
      );
      return response.data.results[0] as PolicyLeaveRequestType;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.MY_POLICY_BALANCES(year)
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS(year)
      });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
