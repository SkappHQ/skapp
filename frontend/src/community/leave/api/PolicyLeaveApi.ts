import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import { invalidateAttendanceLeaveQueries } from "~community/attendance/api/utils/invalidateAttendanceQueries";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { LeaveTrendForYearPreProcessor } from "~community/leave/actions/LeaveTrendPreProcessor";
import { leaveTypeBreakdownPreProcessor } from "~community/leave/actions/LeaveTypeBreakdownPreProcessor";
import { policyLeaveEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { policyLeaveQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  ALL_POLICY_LEAVE_TYPES_ID,
  UNPAGINATED_SIZE
} from "~community/leave/constants/policyLeaveTypeConstants";
import { initialPolicyLeaveRequestParams } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveHistoryDataTypes as EmployeeLeaveHistoryDataTypes } from "~community/leave/types/AnalyticsTypes";
import {
  LeaveTypeBreakDownReturnTypes,
  LeaveTypeBreakdownResponseType
} from "~community/leave/types/LeaveUtilizationTypes";
import {
  EmployeePolicyBalanceType,
  EmployeePolicyBalancesResponse,
  PolicyAbsenceRateResponse,
  PolicyAbsenceRateType,
  PolicyEmployeeLeaveHistoryQueryParams,
  PolicyEmployeeLeaveHistoryResponse,
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
  PolicyPendingLeaveCountResponse,
  PolicyPendingLeaveCountType,
  PolicyResourceAvailabilityDayType,
  PolicyResourceAvailabilityParams,
  PolicyResourceAvailabilityResponse,
  PolicyTeamLeaveHistoryQueryParams,
  PolicyTeamLeaveHistoryResponse,
  UseGetPolicyEmployeeLeaveHistoryArgs
} from "~community/leave/types/PolicyLeaveTypes";
import {
  APIResponseDataType,
  LeaveTrendForYearResponseType,
  LeaveTrendReturnTypes,
  LeaveHistoryDataTypes as TeamLeaveHistoryDataTypes
} from "~community/leave/types/TeamLeaveAnalyticsTypes";
import {
  getPolicyEmployeeLeaveHistoryParams,
  getPolicyLeaveRequestQueryParams
} from "~community/leave/utils/policyLeave/policyLeaveUtils";

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

const getPolicyPendingLeaveCount = async (
  teamId: number | string
): Promise<PolicyPendingLeaveCountType | undefined> => {
  const response = await authFetch.get<PolicyPendingLeaveCountResponse>(
    policyLeaveEndPoints.GET_PENDING_LEAVE_COUNT,
    { params: { teamIds: teamId } }
  );
  return response.data.results[0];
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

export const useGetPolicyPendingLeaveCount = (
  teamId: number | string,
  enabled = true
): UseQueryResult<PolicyPendingLeaveCountType | undefined> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.PENDING_LEAVE_COUNT(teamId),
    queryFn: () => getPolicyPendingLeaveCount(teamId),
    enabled: enabled && teamId !== ""
  });
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

const getPolicyAbsenceRate = async (
  teamId: number | string
): Promise<PolicyAbsenceRateType | undefined> => {
  const response = await authFetch.get<PolicyAbsenceRateResponse>(
    policyLeaveEndPoints.GET_ABSENCE_RATE,
    { params: { teamIds: teamId } }
  );
  return response.data.results[0];
};

export const useGetPolicyAbsenceRate = (
  teamId: number | string,
  enabled = true
): UseQueryResult<PolicyAbsenceRateType | undefined> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.ABSENCE_RATE(teamId),
    queryFn: () => getPolicyAbsenceRate(teamId),
    enabled: enabled && teamId !== ""
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
      enabled && teamIds !== null && teamIds !== "" && !!startDate && !!endDate
  });
};

const isTeamIdSelected = (teamId: number | string): boolean =>
  teamId !== "" && !Number.isNaN(Number(teamId));

const getPolicyTeamLeaveTrend = async (
  teamId: number | string
): Promise<APIResponseDataType<LeaveTrendForYearResponseType>> => {
  const response = await authFetch.get<
    APIResponseDataType<LeaveTrendForYearResponseType>
  >(policyLeaveEndPoints.GET_TEAM_LEAVE_TREND, {
    params: { teamId, leaveTypeIds: ALL_POLICY_LEAVE_TYPES_ID }
  });
  return response.data;
};

export const useGetPolicyTeamLeaveTrend = (
  teamId: number | string,
  enabled = true
): UseQueryResult<LeaveTrendReturnTypes> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.TEAM_LEAVE_TREND(teamId),
    queryFn: () => getPolicyTeamLeaveTrend(teamId),
    select: (data) => LeaveTrendForYearPreProcessor(data),
    enabled: enabled && isTeamIdSelected(teamId)
  });
};

const getPolicyLeaveTypeBreakdown = async (
  teamId: number | string
): Promise<APIResponseDataType<LeaveTypeBreakdownResponseType>> => {
  const response = await authFetch.get<
    APIResponseDataType<LeaveTypeBreakdownResponseType>
  >(policyLeaveEndPoints.GET_LEAVE_TYPE_BREAKDOWN, {
    params: { teamIds: teamId }
  });
  return response.data;
};

export const useGetPolicyLeaveTypeBreakdown = (
  teamId: number | string,
  enabled = true
): UseQueryResult<LeaveTypeBreakDownReturnTypes> => {
  return useQuery({
    queryKey: policyLeaveQueryKeys.LEAVE_TYPE_BREAKDOWN(teamId),
    queryFn: () => getPolicyLeaveTypeBreakdown(teamId),
    select: (data) => leaveTypeBreakdownPreProcessor(data?.results?.[0]),
    enabled: enabled && isTeamIdSelected(teamId)
  });
};

const getPolicyTeamLeaveHistory = async (
  teamId: number,
  params: PolicyTeamLeaveHistoryQueryParams
): Promise<TeamLeaveHistoryDataTypes> => {
  const response = await authFetch.get<PolicyTeamLeaveHistoryResponse>(
    policyLeaveEndPoints.GET_TEAM_LEAVE_HISTORY(teamId),
    { params }
  );
  return response.data.results[0];
};

export const useGetPolicyTeamLeaveHistory = (
  teamId: number,
  enabled = true
): UseQueryResult<TeamLeaveHistoryDataTypes> => {
  const params = useLeaveStore((state) => state.teamLeaveAnalyticParams);

  return useQuery({
    queryKey: policyLeaveQueryKeys.TEAM_LEAVE_HISTORY(teamId, params),
    queryFn: () => getPolicyTeamLeaveHistory(teamId, params),
    enabled: enabled && !Number.isNaN(teamId)
  });
};

const getPolicyEmployeeLeaveHistory = async (
  employeeId: number,
  params: PolicyEmployeeLeaveHistoryQueryParams
): Promise<EmployeeLeaveHistoryDataTypes> => {
  const response = await authFetch.get<PolicyEmployeeLeaveHistoryResponse>(
    policyLeaveEndPoints.GET_EMPLOYEE_LEAVE_HISTORY(employeeId),
    { params }
  );
  return response.data.results[0];
};

export const useGetPolicyEmployeeLeaveHistory = ({
  employeeId,
  selectedDates,
  status,
  type,
  page,
  size,
  isExport,
  enabled = true
}: UseGetPolicyEmployeeLeaveHistoryArgs): UseQueryResult<EmployeeLeaveHistoryDataTypes> => {
  const params = getPolicyEmployeeLeaveHistoryParams(
    selectedDates,
    status,
    type,
    page,
    size,
    isExport
  );

  return useQuery({
    queryKey: policyLeaveQueryKeys.EMPLOYEE_LEAVE_HISTORY(employeeId, params),
    queryFn: () => getPolicyEmployeeLeaveHistory(employeeId, params),
    enabled
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
        queryKey: policyLeaveQueryKeys.ALL_PENDING_LEAVE_COUNT()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_EMPLOYEES_ON_LEAVE_TODAY()
      });
      invalidateAttendanceLeaveQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_RESOURCE_AVAILABILITY()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_TEAM_LEAVE_TREND()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_LEAVE_TYPE_BREAKDOWN()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_ABSENCE_RATE()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_TEAM_LEAVE_HISTORY()
      });
      queryClient.invalidateQueries({
        queryKey: policyLeaveQueryKeys.ALL_EMPLOYEE_LEAVE_HISTORY()
      });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
