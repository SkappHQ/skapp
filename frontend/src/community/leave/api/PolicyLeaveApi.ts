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
  PolicyLeaveRequestType,
  PolicyLeaveSearchQueryParams
} from "~community/leave/types/PolicyLeaveTypes";

// Spring binds a List<> request param from a CSV string, not from the
// bracketed form axios produces for arrays.
const toSearchQueryParams = (
  year: string,
  params: PolicyLeaveRequestParams
): PolicyLeaveSearchQueryParams => {
  const { status, policyId, ...rest } = params;

  return {
    ...rest,
    year,
    status: status.length ? status.join(",") : undefined,
    policyId: policyId.length ? policyId.join(",") : undefined
  };
};

const getMyPolicyBalances = async (
  year: string
): Promise<EmployeePolicyBalanceType[]> => {
  const response = await authFetch.get(
    policyLeaveEndPoints.GET_MY_POLICY_BALANCES(year)
  );

  return response.data.results;
};

const getMyPolicyLeaveRequests = async (
  year: string
): Promise<PolicyLeaveRequestType[]> => {
  const response = await authFetch.get(
    policyLeaveEndPoints.GET_MY_POLICY_LEAVE_REQUESTS(year)
  );

  return response.data.results;
};

const searchMyPolicyLeaveRequests = async (
  year: string,
  params: PolicyLeaveRequestParams
): Promise<PolicyLeaveRequestPageType> => {
  const response = await authFetch.get(
    policyLeaveEndPoints.SEARCH_MY_POLICY_LEAVE_REQUESTS,
    { params: toSearchQueryParams(year, params) }
  );

  return response.data.results[0];
};

const checkPolicyLeaveAvailability = async (
  payload: PolicyLeaveAvailabilityPayload
): Promise<PolicyLeaveAvailabilityType> => {
  const response = await authFetch.post(
    policyLeaveEndPoints.CHECK_POLICY_LEAVE_AVAILABILITY,
    payload
  );

  return response.data.results[0];
};

const applyPolicyLeave = async (
  payload: PolicyLeaveRequestPayload
): Promise<PolicyLeaveRequestType> => {
  const response = await authFetch.post(
    policyLeaveEndPoints.APPLY_POLICY_LEAVE,
    payload
  );

  return response.data.results[0];
};

export const useGetMyPolicyBalances = (
  year: string,
  enabled = true
): UseQueryResult<EmployeePolicyBalanceType[]> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.MY_POLICY_BALANCES(year),
    queryFn: () => getMyPolicyBalances(year),
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
    queryFn: () => getMyPolicyLeaveRequests(year),
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
    queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_SEARCH(
      year,
      params
    ),
    queryFn: () => searchMyPolicyLeaveRequests(year, params),
    enabled,
    refetchOnWindowFocus: false
  });
};

export const useCheckPolicyLeaveAvailability = (): UseMutationResult<
  PolicyLeaveAvailabilityType,
  ErrorResponse,
  PolicyLeaveAvailabilityPayload
> => {
  return useMutation({
    mutationFn: checkPolicyLeaveAvailability
  });
};

export const useApplyPolicyLeave = (
  year: string,
  onSuccess: (data: PolicyLeaveRequestType) => void,
  onError: (messageKey: string, statusCode: number | undefined) => void
): UseMutationResult<
  PolicyLeaveRequestType,
  ErrorResponse,
  PolicyLeaveRequestPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyPolicyLeave,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.MY_POLICY_BALANCES(year)
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS(year)
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_SEARCH(year)
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
