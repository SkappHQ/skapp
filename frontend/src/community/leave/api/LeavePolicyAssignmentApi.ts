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
import { leavePolicyAssignmentQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  AssignLeavePolicyPayload,
  EmployeeLeavePoliciesResponse,
  EmployeeLeavePolicyType,
  UnassignLeavePolicyPayload
} from "~community/leave/types/LeavePolicyTypes";

const getEmployeeLeavePolicies = async (
  employeeId: number
): Promise<EmployeeLeavePolicyType[]> => {
  const response = await authFetch.get<EmployeeLeavePoliciesResponse>(
    leavePolicyAssignmentEndPoints.GET_EMPLOYEE_LEAVE_POLICIES(employeeId)
  );
  return response.data.results;
};

export const useGetEmployeeLeavePolicies = (
  employeeId: number,
  enabled: boolean = true
): UseQueryResult<EmployeeLeavePolicyType[]> => {
  return useQuery({
    queryKey:
      leavePolicyAssignmentQueryKeys.EMPLOYEE_LEAVE_POLICIES(employeeId),
    queryFn: () => getEmployeeLeavePolicies(employeeId),
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
      queryClient.invalidateQueries({
        queryKey: leavePolicyAssignmentQueryKeys.ALL
      });
      onSuccess();
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
      queryClient.invalidateQueries({
        queryKey: leavePolicyAssignmentQueryKeys.ALL
      });
      onSuccess();
    },
    onError
  });
};
