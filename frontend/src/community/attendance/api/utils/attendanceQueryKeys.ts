import {
  TeamTimeRecordParamsType,
  TimeRecordParamsType,
  TimeRequestParamsType
} from "~community/attendance/types/timeSheetTypes";

export const attendanceQueryKeys = {
  getAttendanceConfiguration: function () {
    return ["attendance-config"];
  },
  getEmployeeWorkSummary: function (startDate?: string, endDate?: string) {
    return ["employee-work-summary", startDate, endDate].filter(
      (val) => val !== undefined
    );
  },
  getEmployeeDailyLog: function (startDate?: string, endDate?: string) {
    return ["employee-daily-log", startDate, endDate].filter(
      (val) => val !== undefined
    );
  },
  getEmployeeRequests: function (params?: TimeRequestParamsType) {
    if (params) {
      return ["employee-requests", ...Object.entries(params).flat()];
    } else {
      return ["employee-requests"];
    }
  },
  getManagerRequests: function (params?: TimeRequestParamsType) {
    if (params) {
      return ["manager-requests", ...Object.entries(params).flat()];
    } else {
      return ["manager-requests"];
    }
  },
  getIndividualDailyLog: function (
    startDate: string,
    endDate: string,
    employeeId: number
  ) {
    return ["individual-daily-log", startDate, endDate, employeeId];
  },
  getIndividualWorkHourTrend: function (month: number, employeeId: number) {
    return ["individual-work-hour-trend", month, employeeId];
  },
  getTeamClockInOutGraphData: function (
    teams: number,
    recordType: string,
    timeOffset: string
  ) {
    return ["team-clock-in-out-graph", teams, recordType, timeOffset];
  },
  getManagerRecords: function (params?: TimeRecordParamsType) {
    if (params) {
      return ["manager-records", ...Object.entries(params).flat()];
    } else {
      return ["manager-records"];
    }
  },
  getManagerWorkSummary: function (params?: TimeRecordParamsType) {
    if (params) {
      return ["manager-work-summary", ...Object.entries(params).flat()];
    } else {
      return ["manager-work-summary"];
    }
  },
  getManagerTeamRecords: function (params?: TeamTimeRecordParamsType) {
    if (params) {
      return ["manager-team-records", ...Object.entries(params).flat()];
    } else {
      return ["manager-team-records"];
    }
  },
  getIndividualUtilization: function (employeeId: number) {
    return ["employee-utilization", employeeId];
  },
  getTeamUtilization: function (teamIds: number) {
    return ["team-utilization", teamIds];
  },
  getEmployeePeriodAvailability: function (
    date: string,
    startTime: string,
    endTime: string
  ) {
    return ["employee-period-availability", date, startTime, endTime];
  },
  getAdminRecords: function (params?: TimeRecordParamsType) {
    if (params) {
      return ["admin-records", ...Object.entries(params).flat()];
    } else {
      return ["admin-records"];
    }
  },
  getAdminClockInOutGraphData: function (
    teams: number,
    recordType: string,
    timeOffset: string
  ) {
    return ["admin-clock-in-out-graph", teams, recordType, timeOffset];
  },
  getAdminUtilization: function (teamIds?: number) {
    return ["admin-utilization", teamIds];
  },
  getAdminTeamRecords: function (params?: TeamTimeRecordParamsType) {
    if (params) {
      return ["admin-team-records", ...Object.entries(params).flat()];
    } else {
      return ["admin-team-records"];
    }
  },
  getOrgUtilization: function () {
    return ["org-utilization"];
  },
  getAdminIndividualDailyLog: function (
    startDate: string,
    endDate: string,
    employeeId: number
  ) {
    return ["admin-individual-daily-log", startDate, endDate, employeeId];
  },
  getAdminIndividualUtilization: function (employeeId: number) {
    return ["admin-employee-utilization", employeeId];
  },
  getAdminIndividualWorkHourTrend: function (
    month: number,
    employeeId: number
  ) {
    return ["admin-individual-work-hour-trend", month, employeeId];
  },
  individualWorkHoursGraphData: function (month: string, employeeId: number) {
    return ["workHoursGraphData", month, employeeId].filter(
      (val) => val !== undefined
    );
  },
  getEmployeeDailyLogByEmployeeId: function (
    startDate?: string,
    endDate?: string,
    employeeId?: number
  ) {
    return [
      "employee-daily-log-by-employeeId",
      startDate,
      endDate,
      employeeId
    ].filter((val) => val !== undefined);
  }
};
