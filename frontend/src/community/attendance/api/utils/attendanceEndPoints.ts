export const adminAttendanceEndpoints = {
  ADMIN_ATTENDANCE_CONFIGURATION: "/attendance-config"
};

export const managerAttendanceEndpoints = {
  MANAGER_REQUESTS: "/time/time-requests",
  MANAGER_TEAM_TIME_REQUESTS: "time/analytic/manager/team-time-record-summary",
  INDIVIDUAL_DAILY_LOG: "/time/analytic/manager/employee-daily-log",
  INDIVIDUAL_WORK_HOUR_TREND: "time/analytic/manager/work-hour-graph",
  TEAM_CLOCK_IN_OUT_GRAPH: "time/analytic/manager/team-clockin-clockout-trend",
  MANAGER_APPROVE_DENY_REQUESTS: (id: number): string =>
    `/time/time-request/${id}`,
  MANAGER_RECORDS: "/time/team-time-records",
  MANAGER_WORK_SUMMARY: "/time/attendance-summary",
  INDIVIDUAL_UTILIZATION: (employeeId: number): string =>
    `/time/analytics/individual-utilization/${employeeId}`,
  GET_INDIVIDUAL_WORK_HOURS_GRAPH_DATA: (employeeId: number): string =>
    `/time/analytics/average-employee-hours-worked-trend/${employeeId}`
};

export const employeeAttendanceEndpoints = {
  EMPLOYEE_REQUESTS: "/time/requests",
  GET_DEFAULT_CAPACITY: () => "/time/config",
  EMPLOYEE_DAILY_LOG: "/time/daily-time-records",
  EMPLOYEE_PERIOD_AVAILABILITY: "/time/request-period-availability",
  EMPLOYEE_WORK_SUMMARY: "/time/work-summary",
  EMPLOYEE_CANCEL_REQUEST: "/time/requests-update",
  ADD_MANUAL_ENTRY: "/time/manual-entry",
  EDIT_CLOCK_IN_OUT: "/time/request",
  GET_EMPLOYEE_DAILY_LOG_BY_EMPLOYEE_ID: (employeeId: number) =>
    `/time/daily-time-records/${employeeId}`
};

export const attendanceEndpoints = {
  GET_EMPLOYEE_STATUS: (): string => "/time/active-slot",
  UPDATE_EMPLOYEE_STATUS: (): string => "/time/record",
  GET_INCOMPLETE_CLOCKOUTS: (): string => `/time/incomplete-clockouts`,
  UPDATE_INCOMPLETE_CLOCKOUTS: (id: number): string =>
    `/time/incomplete-clockouts/${id}`,
  GET_EMPLOYEE_LEAVE_STATUS: (date: string): string =>
    `/leave/availability?date=${date}`
};

export const attendanceDashboardEndpoints = {
  GET_ATTENDANCE_DASHBOARD_ANALYTICS: (): string =>
    `/time/analytics/dashboard-summary`,
  GET_CLOCK_IN_OUT_GRAPH_DATA: (): string =>
    `/time/analytics/clockin-clockout-trend`,
  GET_LATE_ARRIVALS_GRAPH_DATA: (): string =>
    `/time/analytics/late-arrival-trend`,
  GET_WORK_HOURS_GRAPH_DATA: (): string =>
    `/time/analytics/average-hours-worked-trend`,
  GET_CLOCK_IN_SUMMARY: (): string => `/time/analytics/clockin-summary`
};
