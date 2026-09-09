import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyAssignmentEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import {
  leaveAnalyticsQueryKeys,
  leaveEntitlementQueryKeys,
  leavePolicyAssignmentQueryKeys,
  leavePolicyQueryKeys
} from "~community/leave/api/utils/QueryKeys";
import {
  AssignLeavePolicyPayload,
  BulkAssignPolicyApiResponse,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse,
  EmployeeLeavePoliciesPage,
  EmployeeLeavePoliciesResponse,
  UnassignLeavePolicyPayload
} from "~community/leave/types/LeavePolicyTypes";

const getEmployeeLeavePolicies = async (
  employeeId: number,
  page: number,
  size: number
): Promise<EmployeeLeavePoliciesPage> => {
  const response = await authFetch.get<EmployeeLeavePoliciesResponse>(
    leavePolicyAssignmentEndPoints.GET_EMPLOYEE_LEAVE_POLICIES(
      employeeId,
      page,
      size
    )
  );
  return response.data.results[0];
};

export const useGetEmployeeLeavePolicies = (
  employeeId: number,
  page: number,
  size: number,
  enabled: boolean = true
): UseQueryResult<EmployeeLeavePoliciesPage> => {
  return useQuery({
    queryKey: leavePolicyAssignmentQueryKeys.EMPLOYEE_LEAVE_POLICIES(
      employeeId,
      page,
      size
    ),
    queryFn: () => getEmployeeLeavePolicies(employeeId, page, size),
    enabled
  });
};

const assignLeavePolicy = (
  payload: AssignLeavePolicyPayload
): Promise<AxiosResponse<EmployeeLeavePoliciesResponse>> =>
  authFetch.post<EmployeeLeavePoliciesResponse>(
    leavePolicyAssignmentEndPoints.ASSIGN_LEAVE_POLICY,
    payload
  );

export const useAssignLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<EmployeeLeavePoliciesResponse>,
  AxiosError,
  AssignLeavePolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: leavePolicyAssignmentQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey:
          leaveAnalyticsQueryKeys.EMPLOYEE_LEAVE_ENTITLEMENTS_FOR_ANALYTICS_ALL
      });
      onSuccess();
    },
    onError
  });
};

const bulkAssignLeavePolicies = async (
  payload: BulkAssignPolicyPayload
): Promise<BulkAssignPolicyResponse> => {
  const response = await authFetch.post<BulkAssignPolicyApiResponse>(
    leavePolicyAssignmentEndPoints.BULK_ASSIGN_LEAVE_POLICIES,
    payload
  );
  return response.data.results[0];
};

export const useBulkAssignLeavePolicies = (
  onSuccess: (assignmentResult: BulkAssignPolicyResponse) => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  BulkAssignPolicyResponse,
  AxiosError,
  BulkAssignPolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAssignLeavePolicies,
    onSuccess: (assignmentResult) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: leavePolicyAssignmentQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENTS()
      });
      onSuccess(assignmentResult);
    },
    onError
  });
};

const unassignLeavePolicy = (
  payload: UnassignLeavePolicyPayload
): Promise<AxiosResponse<EmployeeLeavePoliciesResponse>> =>
  authFetch.delete<EmployeeLeavePoliciesResponse>(
    leavePolicyAssignmentEndPoints.UNASSIGN_LEAVE_POLICY,
    { data: payload }
  );

export const useUnassignLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<EmployeeLeavePoliciesResponse>,
  AxiosError,
  UnassignLeavePolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassignLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      queryClient.invalidateQueries({
        queryKey: leavePolicyAssignmentQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey:
          leaveAnalyticsQueryKeys.EMPLOYEE_LEAVE_ENTITLEMENTS_FOR_ANALYTICS_ALL
      });
      onSuccess();
    },
    onError
  });
};
