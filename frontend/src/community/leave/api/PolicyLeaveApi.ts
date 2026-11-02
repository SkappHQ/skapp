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
import { initialPolicyLeaveRequestParams } from "~community/leave/store/policyLeaveStore";
import {
  EmployeePolicyBalanceType,
  EmployeePolicyBalancesResponse,
  PolicyEmployeesOnLeaveResponse,
  PolicyEmployeesOnLeaveType,
  PolicyLeaveAvailabilityPayload,
  PolicyLeaveAvailabilityResponse,
  PolicyLeaveAvailabilityType,
  PolicyLeaveRequestPageResponse,
  PolicyLeaveRequestPageType,
  PolicyLeaveRequestPayload,
  PolicyLeaveRequestQueryParams,
  PolicyLeaveRequestResponse,
  PolicyLeaveRequestType,
  PolicyResourceAvailabilityDayType,
  PolicyResourceAvailabilityParams,
  PolicyResourceAvailabilityResponse
} from "~community/leave/types/PolicyLeaveTypes";
import { getPolicyLeaveRequestQueryParams } from "~community/leave/utils/policyLeave/policyLeaveUtils";

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

const getPolicyEmployeesOnLeaveToday = async (
  teamId: number | string
): Promise<PolicyEmployeesOnLeaveType> => {
  const response = await authFetch.get<PolicyEmployeesOnLeaveResponse>(
    policyLeaveEndPoints.GET_EMPLOYEES_ON_LEAVE_TODAY,
    { params: { teamIds: teamId } }
  );
  return response.data.results[0];
};

export const useGetPolicyEmployeesOnLeaveToday = (
  teamId: number | string,
  enabled = true
): UseQueryResult<PolicyEmployeesOnLeaveType> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.EMPLOYEES_ON_LEAVE_TODAY(teamId),
    queryFn: () => getPolicyEmployeesOnLeaveToday(teamId),
    enabled: enabled && teamId !== "",
    refetchOnWindowFocus: false
  });
};

const getPolicyResourceAvailability = async (
  teamIds: number | string | null,
  startDate: string,
  endDate: string
): Promise<PolicyResourceAvailabilityDayType[]> => {
  const response = await authFetch.get<PolicyResourceAvailabilityResponse>(
    policyLeaveEndPoints.GET_RESOURCE_AVAILABILITY,
    { params: { teamIds, startDate, endDate } }
  );
  return response.data.results;
};

export const useGetPolicyResourceAvailability = ({
  teamIds,
  startDate,
  endDate,
  enabled = true
}: PolicyResourceAvailabilityParams): UseQueryResult<
  PolicyResourceAvailabilityDayType[]
> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.RESOURCE_AVAILABILITY(
      teamIds,
      startDate,
      endDate
    ),
    queryFn: () => getPolicyResourceAvailability(teamIds, startDate, endDate),
    enabled:
      enabled && teamIds !== null && teamIds !== "" && !!startDate && !!endDate,
    refetchOnWindowFocus: false
  });
};

const getMyPolicyLeaveRequestsPage = async (
  queryParams: PolicyLeaveRequestQueryParams
): Promise<PolicyLeaveRequestPageType> => {
  const response = await authFetch.get<PolicyLeaveRequestPageResponse>(
    policyLeaveEndPoints.GET_MY_POLICY_LEAVE_REQUESTS,
    { params: queryParams }
  );
  return response.data.results[0];
};

export const useGetMyPolicyLeaveRequestsPage = (
  queryParams: PolicyLeaveRequestQueryParams,
  enabled = true
): UseQueryResult<PolicyLeaveRequestPageType> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.MY_POLICY_LEAVE_REQUESTS_PAGE(queryParams),
    queryFn: () => getMyPolicyLeaveRequestsPage(queryParams),
    enabled,
    refetchOnWindowFocus: false
  });
};

const getMyPolicyLeaveRequests = async (
  year: string
): Promise<PolicyLeaveRequestType[]> => {
  const page = await getMyPolicyLeaveRequestsPage(
    getPolicyLeaveRequestQueryParams(year, {
      ...initialPolicyLeaveRequestParams,
      size: UNPAGINATED_SIZE
    })
  );
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
  onError: (messageKey: string) => void
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
        queryKey: policyLeaveQueryKeys.ALL_EMPLOYEES_ON_LEAVE_TODAY()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_RESOURCE_AVAILABILITY()
      });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
