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
import { UNPAGINATED_SIZE } from "~community/leave/constants/policyLeaveTypeConstants";
import {
  PolicyLeaveRequestParams,
  initialPolicyLeaveRequestParams
} from "~community/leave/store/policyLeaveStore";
import {
  EmployeePolicyBalanceType,
  EmployeePolicyBalancesResponse,
  PolicyLeaveAvailabilityPayload,
  PolicyLeaveAvailabilityResponse,
  PolicyLeaveAvailabilityType,
  PolicyLeaveRequestPageResponse,
  PolicyLeaveRequestPageType,
  PolicyLeaveRequestPayload,
  PolicyLeaveRequestQueryParams,
  PolicyLeaveRequestResponse,
  PolicyLeaveRequestType
} from "~community/leave/types/PolicyLeaveTypes";

const getMyPolicyBalances = async (
  year: string
): Promise<EmployeePolicyBalanceType[]> => {
  const response = await authFetch.get<EmployeePolicyBalancesResponse>(
    policyLeaveEndPoints.GET_MY_POLICY_BALANCES(year)
  );
  return response.data.results;
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

const getMyPolicyLeaveRequestsPage = async (
  year: string,
  params: PolicyLeaveRequestParams
): Promise<PolicyLeaveRequestPageType> => {
  const { status, policyId, ...rest } = params;

  const queryParams: PolicyLeaveRequestQueryParams = {
    ...rest,
    year,
    status: status.length ? status.join(",") : undefined,
    policyId: policyId.length ? policyId.join(",") : undefined
  };

  const response = await authFetch.get<PolicyLeaveRequestPageResponse>(
    policyLeaveEndPoints.GET_MY_POLICY_LEAVE_REQUESTS,
    { params: queryParams }
  );
  return response.data.results[0];
};

export const useGetMyPolicyLeaveRequestsPage = (
  year: string,
  params: PolicyLeaveRequestParams,
  enabled = true
): UseQueryResult<PolicyLeaveRequestPageType> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_PAGE(year, params),
    queryFn: () => getMyPolicyLeaveRequestsPage(year, params),
    enabled,
    refetchOnWindowFocus: false
  });
};

const getMyPolicyLeaveRequests = async (
  year: string
): Promise<PolicyLeaveRequestType[]> => {
  // The apply leave calendar needs every request raised in the year, not a page
  // of them; a negative size tells the backend to skip pagination.
  const page = await getMyPolicyLeaveRequestsPage(year, {
    ...initialPolicyLeaveRequestParams,
    size: UNPAGINATED_SIZE
  });
  return page.items;
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

const checkPolicyLeaveAvailability = async (
  payload: PolicyLeaveAvailabilityPayload
): Promise<PolicyLeaveAvailabilityType> => {
  const response = await authFetch.post<PolicyLeaveAvailabilityResponse>(
    policyLeaveEndPoints.CHECK_POLICY_LEAVE_AVAILABILITY,
    payload
  );
  return response.data.results[0];
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

const applyPolicyLeave = async (
  payload: PolicyLeaveRequestPayload
): Promise<PolicyLeaveRequestType> => {
  const response = await authFetch.post<PolicyLeaveRequestResponse>(
    policyLeaveEndPoints.APPLY_POLICY_LEAVE,
    payload
  );
  return response.data.results[0];
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
