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
import { PolicyLeaveRequestParams } from "~community/leave/store/policyLeaveStore";
import {
  EmployeePolicyBalanceType,
  PolicyLeaveAvailabilityPayload,
  PolicyLeaveAvailabilityType,
  PolicyLeaveRequestPageType,
  PolicyLeaveRequestPayload,
  PolicyLeaveRequestType
} from "~community/leave/types/PolicyLeaveTypes";

export const useGetMyPolicyBalances = (
  year: string,
  enabled = true
): UseQueryResult<EmployeePolicyBalanceType[]> => {
  return useQuery({
    queryKey: [policyLeaveQueryKeys.MY_POLICY_BALANCES, year],
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
    queryKey: [policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS, year],
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

export const useSearchMyPolicyLeaveRequests = (
  year: string,
  params: PolicyLeaveRequestParams,
  enabled = true
): UseQueryResult<PolicyLeaveRequestPageType> => {
  return useQuery({
    queryKey: [
      policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_SEARCH,
      year,
      params
    ],
    queryFn: async () => {
      const response = await authFetch.get(
        policyLeaveEndPoints.SEARCH_MY_POLICY_LEAVE_REQUESTS,
        { params: { ...params, year } }
      );
      return response.data.results[0] as PolicyLeaveRequestPageType;
    },
    enabled,
    refetchOnWindowFocus: false
  });
};

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
  onError: (messageKey: string, statusCode?: number) => void
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
        queryKey: [policyLeaveQueryKeys.MY_POLICY_BALANCES, year]
      });
      queryClient.invalidateQueries({
        queryKey: [policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS, year]
      });
      queryClient.invalidateQueries({
        queryKey: [policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_SEARCH, year]
      });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(
        error?.response?.data?.results?.[0]?.messageKey ?? "",
        error?.response?.status
      );
    }
  });
};
