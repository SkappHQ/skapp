import {
  ClockInOutGraphDataType,
  ClockInSummaryParamType,
  LateArrivalsGraphDataType,
  WorkHoursGraphDataType
} from "~community/attendance/types/attendanceDashboardTypes";

export const getAttendanceQueryKeys = {
  employeeStatus: () => ["employeeStatus"],
  updateEmployeeStatus: () => ["updateEmployeeStatus"],
  incompleteClockOuts: () => ["incompleteClockOuts"],
  employeeLeaveStatus: () => ["employee-leave-status"]
};

export const employeeQueryKeys = {
  all: ["employee-api"],
  employeeDefaultCapacity: function (type?: string) {
    return [...(this?.all || []), "get-default-capacity", type];
  }
};

export const getAttendanceDashboardQueryKeys = {
  attendanceDashboardAnalytics: function (teams: string | number) {
    return ["attendanceDashboardAnalytics", teams].filter(
      (val) => val !== undefined
    );
  },
  clockInOutGraphData: function (params: ClockInOutGraphDataType) {
    return ["clockInOutGraphData", params].filter((val) => val !== undefined);
  },
  lateArrivalsGraphData: function (params: LateArrivalsGraphDataType) {
    return ["lateArrivalsGraphData", params].filter((val) => val !== undefined);
  },
  workHoursGraphData: function (params: WorkHoursGraphDataType) {
    return ["workHoursGraphData", params].filter((val) => val !== undefined);
  },
  clockInSummaryData: function (params: ClockInSummaryParamType) {
    return ["clockInSummaryData", params].filter((val) => val !== undefined);
  }
};
