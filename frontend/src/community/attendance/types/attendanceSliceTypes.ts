import { AttendanceStore } from "~community/attendance/types/attendanceStoreTypes";

export interface AttendanceSliceType
  extends Pick<
    AttendanceStore,
    | "attendanceParams"
    | "attendanceLeaveStatus"
    | "isAttendanceModalOpen"
    | "isPreMidnightClockOutAlertOpen"
    | "isAutoClockOutMidnightModalOpen"
    | "setSlotType"
    | "setAttendanceParams"
    | "setAttendanceLeaveStatus"
    | "setIsAttendanceModalOpen"
    | "setIsPreMidnightClockOutAlertOpen"
    | "setIsAutoClockOutMidnightModalOpen"
  > {}

export interface ManagerTimesheetFiltersSliceTypes
  extends Pick<
    AttendanceStore,
    | "timesheetRequestsFilters"
    | "timesheetRequestSelectedDates"
    | "timesheetRequestParams"
    | "timesheetRequestsFilterValues"
    | "setTimesheetRequestsFilters"
    | "resetTimesheetRequestParams"
    | "setTimesheetRequestSelectedDates"
    | "setTimesheetRequestPagination"
    | "timesheetAnalyticsParams"
    | "setTimesheetAnalyticsSelectedDates"
    | "timesheetAnalyticsSelectedDates"
    | "setTimesheetAnalyticsMonthWeek"
    | "setTimesheetAnalyticsTeam"
    | "setTimesheetAnalyticsPagination"
    | "timesheetAnalyticsSelectedTeamName"
    | "setTimesheetAnalyticsTeamName"
  > {}

export interface EmployeeTimesheetModalSliceType
  extends Pick<
    AttendanceStore,
    | "selectedDailyRecord"
    | "timeAvailabilityForPeriod"
    | "isEmployeeTimesheetModalOpen"
    | "employeeTimesheetModalType"
    | "setSelectedDailyRecord"
    | "setIsEmployeeTimesheetModalOpen"
    | "setEmployeeTimesheetModalType"
    | "setTimeAvailabilityForPeriod"
    | "setCurrentAddTimeChanges"
    | "currentAddTimeChanges"
  > {}

export interface EmployeeTimesheetFilterSliceTypes
  extends Pick<
    AttendanceStore,
    | "employeeTimesheetRequestsFilters"
    | "employeeTimesheetRequestSelectedDates"
    | "employeeTimesheetRequestParams"
    | "employeeTimesheetRequestsFilterValues"
    | "setEmployeeTimesheetRequestsFilters"
    | "resetEmployeeTimesheetRequestParams"
    | "setEmployeeTimesheetRequestSelectedDates"
    | "setEmployeeTimesheetRequestPagination"
  > {}

export interface ClockInSummarySliceType
  extends Pick<AttendanceStore, "clockInType" | "setClockInType"> {}
