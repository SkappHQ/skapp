import { QueryClient } from "@tanstack/react-query";

import { attendanceQueryKeys } from "~community/attendance/api/utils/attendanceQueryKeys";
import { getAttendanceQueryKeys } from "~community/attendance/api/utils/queryKeys";

export const invalidateAttendanceTimeRecordQueries = (
  queryClient: QueryClient
): void => {
  const queryKeys = [
    getAttendanceQueryKeys.employeeStatus(),
    attendanceQueryKeys.getEmployeeWorkSummary(),
    attendanceQueryKeys.getEmployeeDailyLog()
  ];

  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey }).catch((error) => error);
  });
};
