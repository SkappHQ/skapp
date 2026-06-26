import { DateTime } from "luxon";

import { LeaveEntitlementParamsType } from "~community/leave/types/LeaveEntitlementTypes";

export const leaveQueryKeys = {
  ALL: ["all-leaves"],
  CUSTOM_LEAVES: function (
    page?: number,
    size?: number,
    keyword?: string,
    year?: number,
    selectedLeaveTypes?: string[]
  ) {
    return [
      ...(this?.ALL || []),
      "custom-leaves",
      page,
      size,
      keyword,
      year,
      selectedLeaveTypes
    ].filter((val) => val !== undefined);
  },
  useGetPreProcessedLeaveTypes: function (
    filterByInUse: boolean = false,
    isCarryForward: boolean = false
  ) {
    return [
      ...(this?.ALL || []),
      "get-leave-types",
      filterByInUse,
      isCarryForward
    ].filter((val) => val !== undefined);
  },
  LEAVE_CYCLE: ["leave-cycle"],
  EMPLOYEE_LEAVE_ALLOCATION: ["employee-leave-allocation"],
  PENDING_LEAVES: ["pending-leaves"],
  EMPLOYEE_LEAVE_REQUESTS: ["employee-leave-requests"],
  EMPLOYEE_LEAVE_REQUEST_DATA: ["employee-leave-request-data"],
  LEAVE_REQUEST_NUDGED: ["is-leave-request-nudged"],
  TEAM_LEAVE_HISTORY: ["team-leave-history"],
  TEAM_LEAVE_TREND_FOR_YEAR: ["team-leave-trend-year"]
};

export const leaveEntitlementQueryKeys = {
  ALL: ["all-leave-entitlements"],
  ALL_LEAVE_ENTITLEMENTS: function (params?: LeaveEntitlementParamsType) {
    if (params)
      return ["all-leave-entitlements", ...Object.entries(params).flat()];
    else return ["all-leave-entitlements"];
  },
  LEAVE_ENTITLEMENTS: function (params?: LeaveEntitlementParamsType) {
    if (params)
      return ["all-leave-entitlements", ...Object.entries(params).flat()];
    else return ["all-leave-entitlements"];
  },
  MY_LEAVE_ALLOCATION: ["my-leave-allocation"],
  LEAVE_ENTITLEMENT_BALANCE: function (id: number) {
    return [...(this?.ALL || []), "leave-entitlement-balance", id];
  }
};

export const leaveAnalyticsQueryKeys = {
  EMPLOYEE_LEAVE_ENTITLEMENTS_FOR_ANALYTICS: function (employeeId: number) {
    return ["employee-leave-entitlements", employeeId];
  },
  EMPLOYEE_LEAVE_HISTORY: function (
    employeeId: number,
    selectedDates: Date[],
    status: string[],
    type: string[],
    page: number,
    size: number,
    isExport: boolean,
    selectedStartDate: Date,
    startDate: string | DateTime<boolean>,
    selectedEndDate: Date,
    endDate: string | DateTime<boolean>
  ) {
    return [
      ["leave-analytics"],
      "get-employee-leave-history",
      employeeId,
      selectedDates,
      page,
      size,
      status,
      type,
      isExport,
      selectedStartDate,
      startDate,
      selectedEndDate,
      endDate
    ];
  },
  LEAVE_TYPE_UTILIZATION: function (
    employeeId: number,
    startDate: string | DateTime<boolean>,
    endDate: string | DateTime<boolean>
  ) {
    return [
      "leave-analytics",
      "get-leave-type-utilization-details",
      employeeId,
      startDate,
      endDate
    ];
  }
};

export const leaveTypeQueryKeys = {
  ALL: ["all-leave-types"],
  LEAVE_TYPES: function ({
    filterByInUse,
    isCarryForward,
    employeeId
  }: {
    filterByInUse?: boolean;
    isCarryForward?: boolean;
    employeeId?: number;
  }) {
    return [
      ...(this?.ALL || []),
      "leave-types",
      filterByInUse,
      isCarryForward,
      employeeId
    ];
  },
  leaveCycle: ["leaveCycle"],

  CARRY_FORWARD_LEAVE_TYPES: function (
    leaveTypes: number[],
    page?: number,
    size?: number,
    year?: number
  ) {
    return [
      ...(this?.ALL || []),
      "carry-Forward-LeaveTypes",
      leaveTypes,
      page,
      size,
      year
    ].filter((val) => val !== undefined);
  }
};

export const myRequestsQueryKeys = {
  ALL: ["all-my-requests"],
  MY_REQUESTS: function (isExport: boolean) {
    return [...(this?.ALL || []), "my-requests", isExport.toString()];
  },
  APPLY_LEAVE: ["apply-leave"],
  RESOURCE_AVAILABILITY: function (
    teams: number | null,
    startDate: string,
    endDate: string
  ) {
    return [
      ...(this?.ALL || []),
      "resource-availability",
      teams,
      startDate,
      endDate
    ];
  }
};

export const dashboardQueryKeys = {
  RESOURCE_AVAILABILITY: function (
    teams: number | string,
    startDate: string,
    endDate: string
  ) {
    return ["resource-availability", teams, startDate, endDate].filter(
      (val) => val !== undefined
    );
  },
  RESOURCE_AVAILABILITY_CALENDAR: function (
    teams: number | string,
    year?: number,
    month?: string
  ) {
    return ["resource-availability-calendar", teams, year, month].filter(
      (val) => val !== undefined
    );
  },
  LEAVE_UTILIZATION: function (teamIds: number | string) {
    return ["leave-utilization", teamIds].filter((val) => val !== undefined);
  },
  TODAYS_AVAILABILITY: function (teams: number | string, date: string) {
    return ["todays-availability", teams, date].filter(
      (val) => val !== undefined
    );
  },
  PENDING_REQUESTS: function (teams: number | string) {
    return ["pending-requests", teams].filter((val) => val !== undefined);
  },
  ABSENCE_RATE: function (teamIds: string | number) {
    return ["absence-rate", teamIds].filter((val) => val !== undefined);
  }
};

export const reportsQueryKeys = {
  getEmployeeLeaveReport: ["getEmployeeLeaveReport"],
  getEmployeeLeaveReportByAdmin: function (
    year: string,
    leaveTypeIds: string[],
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string
  ) {
    return [
      "getEmployeeLeaveReport",
      year,
      leaveTypeIds,
      teamId,
      page,
      size,
      sortKey,
      sortOrder
    ];
  },
  getEmployeeLeaveReportCSV: function (
    year: string,
    leaveTypeIds: string[],
    teamId: string,
    leaveStatus: string[]
  ) {
    return ["getEmployeeLeaveReport", year, leaveTypeIds, teamId, leaveStatus];
  },
  getEmployeeCustomAllocation: function (
    year: string,
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string,
    leaveTypeId: string[]
  ) {
    return [
      "getEmployeeCustomAllocationReport",
      year,
      teamId,
      page,
      size,
      sortKey,
      sortOrder,
      leaveTypeId
    ];
  },
  getEmployeeLeaveRequests: function (
    year: string,
    teamId: string,
    page: number,
    size: number,
    sortKey: string,
    sortOrder: string,
    leaveTypeId: string[],
    leaveStatus: string[]
  ) {
    return [
      "getEmployeeLeaveRequests",
      year,
      teamId,
      page,
      size,
      sortKey,
      sortOrder,
      leaveTypeId,
      leaveStatus
    ];
  }
};
