import { moduleAPIPath } from "~community/common/constants/configs";

export const leaveEndPoints = {
  GET_CUSTOM_LEAVES: `${moduleAPIPath.LEAVE}/entitlement/custom`,
  GET_LEAVE_TYPES: `${moduleAPIPath.LEAVE}/types`,
  CARRY_FORWARD_LEAVE_TYPES: `${moduleAPIPath.LEAVE}/entitlement/carry-forward`,
  UPDATE_CARRY_FORWARD_LEAVE_TYPE: (
    leaveTypes: number[],
    cycleStartYear: number
  ) =>
    `${
      moduleAPIPath.LEAVE
    }/leave/entitlement/carry-forward/?${cycleStartYear}&leaveTypes=${leaveTypes.join(
      ","
    )}`,
  UPDATE_CUSTOM_LEAVE: (id: number) =>
    `${moduleAPIPath.LEAVE}/entitlement/custom/${id}`,
  GET_LEAVE_CYCLE: `leave-cycle`,
  GET_LEAVE_ALLOCATIONS: (startDate: string, endDate: string): string =>
    `${moduleAPIPath.LEAVE}/entitlement/user/entitlements?startDate=${startDate}&endDate=${endDate}`,
  PENDING_LEAVES: `${moduleAPIPath.LEAVE}/pending-requests`,
  UPDATE_LEAVE_REQUEST: (id: number) => `${moduleAPIPath.LEAVE}/managers/${id}`,
  MANAGER_LEAVES: `${moduleAPIPath.LEAVE}/requests`,
  GET_LEAVE_BY_ID: (id: number) => `${moduleAPIPath.LEAVE}/manager/${id}`,
  LEAVES: `${moduleAPIPath.LEAVE}`,
  SPECIFIC_LEAVE: (id: number) => `${moduleAPIPath.LEAVE}/${id}`,
  NUDGE_NOTIFICATIONS: (leaveId: number) => `/leave/nudge/${leaveId}`,
  CHECK_NUDGED: (leaveId: number) => `/leave/nudge/${leaveId}/status`
};

export const leaveTypeEndPoints = {
  GET_LEAVE_TYPES: `${moduleAPIPath.LEAVE}/types`,
  ADD_LEAVE_TYPE: `${moduleAPIPath.LEAVE}/types`,
  EDIT_LEAVE_TYPE: (id: number) => `${moduleAPIPath.LEAVE}/types/${id}`
};

export const leavePolicyEndPoints = {
  ADD_LEAVE_POLICY: `${moduleAPIPath.LEAVE}/policies`,
  UPDATE_LEAVE_POLICY: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policies/${id}`,
  DEACTIVATE_LEAVE_POLICY: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policies/${id}/deactivate`,
  ACTIVATE_LEAVE_POLICY: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policies/${id}/activate`,
  GET_LEAVE_POLICIES: `${moduleAPIPath.LEAVE}/policies`,
  ENABLE_LEAVE_POLICIES: `${moduleAPIPath.LEAVE}/policies/enable`,
  GET_LEAVE_POLICY_CONFIG: `${moduleAPIPath.LEAVE}/policies/config`
};

export const policyLeaveTypeEndPoints = {
  GET_POLICY_LEAVE_TYPES: `${moduleAPIPath.LEAVE}/policy-leave-types`,
  ADD_POLICY_LEAVE_TYPE: `${moduleAPIPath.LEAVE}/policy-leave-types`,
  GET_POLICY_LEAVE_TYPE: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policy-leave-types/${id}`,
  UPDATE_POLICY_LEAVE_TYPE: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policy-leave-types/${id}`,
  ACTIVATE_POLICY_LEAVE_TYPE: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policy-leave-types/${id}/activate`,
  DEACTIVATE_POLICY_LEAVE_TYPE: (id: number): string =>
    `${moduleAPIPath.LEAVE}/policy-leave-types/${id}/deactivate`
};

export const leavePolicyAssignmentEndPoints = {
  ASSIGN_LEAVE_POLICY: `${moduleAPIPath.LEAVE}/policy-assignments`,
  UNASSIGN_LEAVE_POLICY: `${moduleAPIPath.LEAVE}/policy-assignments`,
  GET_EMPLOYEE_LEAVE_POLICIES: (
    employeeId: number,
    page: number,
    size: number
  ): string =>
    `${moduleAPIPath.LEAVE}/policy-assignments/employee/${employeeId}?page=${page}&size=${size}`
};

export const policyLeaveEndPoints = {
  GET_MY_POLICY_BALANCES: (year: string): string =>
    `${moduleAPIPath.LEAVE}/policy-leave/balances?year=${year}`,
  CHECK_POLICY_LEAVE_AVAILABILITY: `${moduleAPIPath.LEAVE}/policy-leave/availability`,
  APPLY_POLICY_LEAVE: `${moduleAPIPath.LEAVE}/policy-leave`,
  GET_MY_POLICY_LEAVE_REQUESTS: `${moduleAPIPath.LEAVE}/policy-leave`
};

export const leaveEntitlementEndPoints = {
  GET_LEAVE_ENTITLEMENTS: `${moduleAPIPath.LEAVE}/entitlement`,
  ADD_BULK_LEAVE_ENTITLEMENTS: `${moduleAPIPath.LEAVE}/entitlement/bulk`,
  GET_LEAVE_ALLOCATIONS: (startDate: string, endDate: string): string =>
    `${moduleAPIPath.LEAVE}/entitlement/user/entitlements?startDate=${startDate}&endDate=${endDate}`,
  GET_MY_LEAVE_ENTITLEMENT_BALANCE: (id: number): string =>
    `${moduleAPIPath.LEAVE}/entitlement/balance/${id}`
};

export const myRequestsEndPoints = {
  GET_MY_REQUESTS: `${moduleAPIPath.LEAVE}`,
  APPLY_LEAVE: `${moduleAPIPath.LEAVE}`,
  RESOURCE_AVAILABILITY: `${moduleAPIPath.LEAVE}/resource-availability-calender`
};

export const leaveAnalyticsEndpoints = {
  GET_EMPLOYEE_LEAVE_ENTITLEMENTS: (employeeId: number): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-leave-entitlements/${employeeId}`,
  EMPLOYEE_LEAVE_HISTORY: (employeeId: number): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-leave-history/${employeeId}`,
  LEAVE_UTILIZATION_CHART: (): string =>
    `${moduleAPIPath.LEAVE}/analytics/leave-utilization`
};

export const leaveDashboardEndPoints = {
  GET_RESOURCE_AVAILABILITY: `${moduleAPIPath.LEAVE}/resource-availability-calender`,
  LEAVE_TYPE_BREAKDOWN_CHART: `${moduleAPIPath.LEAVE}/analytics/leave-type-breakdown`,
  TODAYS_AVAILABILITY: `${moduleAPIPath.LEAVE}/analytics/onleave`,
  PENDING_LEAVES: `${moduleAPIPath.LEAVE}/analytics/all/leaves?status=PENDING`,
  ABSENCE_RATE: `${moduleAPIPath.LEAVE}/analytics/organizational-absence-rates`
};

export const analyticAPIs = {
  TEAM_LEAVE_HISTORY: (teamId: number): string =>
    `${moduleAPIPath.LEAVE}/analytics/team-leave-history/${teamId}`,
  TEAM_LEAVE_TREND_FOR_YEAR: (): string =>
    `${moduleAPIPath.LEAVE}/analytics/team-leave-trend`,
  EMPLOYEELEAVEREPORT: (
    year: string,
    leaveTypeId: string[],
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string
  ): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-entitlement?year=${year}&leaveTypeId=${leaveTypeId}&teamId=${teamId}&page=${page}&size=${size}&sortKey=${sortKey}&sortOrder=${sortOrder}`,
  EMPLOYEECUSTOMALLOCATIONSREPORT: (
    year: string,
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string,
    leaveTypeId: string[]
  ): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-custom-entitlements?year=${year}&leaveTypeId=${leaveTypeId}&teamId=${teamId}&page=${page}&size=${size}&sortKey=${sortKey}&sortOrder=${sortOrder}`,
  EMPLOYEELEAVEREQUESTSREPORT: (
    year: string,
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string,
    leaveTypeId: string[],
    leaveStatus: string[]
  ): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-leave-requests?year=${year}&leaveTypeId=${leaveTypeId}&teamId=${teamId}&page=${page}&size=${size}&sortKey=${sortKey}&sortOrder=${sortOrder}&leaveRequestStatus=${leaveStatus}`,
  EMPLOYEELEAVEREPORTCSV: (
    year: string,
    leaveTypeIds: string[],
    teamId: string,
    leaveStatus: string[]
  ): string =>
    `${moduleAPIPath.LEAVE}/analytics/employee-leave-report-file?year=${year}&teamId=${teamId}&leaveTypeId=${leaveTypeIds}&leaveRequestStatus=${leaveStatus}`
};
