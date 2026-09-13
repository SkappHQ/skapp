import { QueryClient } from "@tanstack/react-query";

import { attendanceQueryKeys } from "~community/attendance/api/utils/attendanceQueryKeys";
import { getAttendanceQueryKeys } from "~community/attendance/api/utils/queryKeys";

const invalidateQueryKeys = (
  queryClient: QueryClient,
  queryKeys: unknown[][]
): void => {
  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey }).catch((error) => error);
  });
};

export const invalidateAttendanceTimeRecordQueries = (
  queryClient: QueryClient
): void => {
  invalidateQueryKeys(queryClient, [
    getAttendanceQueryKeys.employeeStatus(),
    attendanceQueryKeys.getEmployeeWorkSummary(),
    attendanceQueryKeys.getEmployeeDailyLog()
  ]);
};

export const invalidateTimeEntryQueries = (queryClient: QueryClient): void => {
  invalidateQueryKeys(queryClient, [
    getAttendanceQueryKeys.employeeStatus(),
    attendanceQueryKeys.getEmployeeWorkSummary(),
    attendanceQueryKeys.getEmployeeDailyLog(),
    attendanceQueryKeys.getEmployeeDailyLogByEmployeeId(),
    attendanceQueryKeys.getEmployeeRequests(),
    attendanceQueryKeys.getManagerRequests(),
    attendanceQueryKeys.getManagerRecords(),
    attendanceQueryKeys.getManagerWorkSummary()
  ]);
};
