import { useEffect } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";

/**
 * Shared filter-count derivation + unmount cleanup for the employee and
 * manager timesheet-request tables, which mirror each other except for
 * which store slice (`employeeTimesheetRequest*` vs `timesheetRequest*`)
 * they read from.
 */
export const useTimesheetRequestFilterState = (
  isManager: boolean,
  shouldRegisterCleanup = true
): { filterCount: number } => {
  const {
    employeeTimesheetRequestsFilters,
    employeeTimesheetRequestSelectedDates,
    resetEmployeeTimesheetRequestParams,
    setEmployeeTimesheetRequestSelectedDates,
    timesheetRequestsFilters,
    timesheetRequestSelectedDates,
    resetTimesheetRequestParams,
    setTimesheetRequestSelectedDates
  } = useAttendanceStore((state) => state);

  const appliedStatus = isManager
    ? timesheetRequestsFilters.status
    : employeeTimesheetRequestsFilters.status;
  const [appliedStartDate, appliedEndDate] = isManager
    ? timesheetRequestSelectedDates
    : employeeTimesheetRequestSelectedDates;
  const resetParams = isManager
    ? resetTimesheetRequestParams
    : resetEmployeeTimesheetRequestParams;
  const setDates = isManager
    ? setTimesheetRequestSelectedDates
    : setEmployeeTimesheetRequestSelectedDates;

  useEffect(() => {
    if (!shouldRegisterCleanup) return;
    return () => {
      resetParams();
      setDates(["", ""]);
    };
  }, [shouldRegisterCleanup, resetParams, setDates]);

  return {
    filterCount: appliedStatus.length + (appliedStartDate || appliedEndDate ? 1 : 0)
  };
};
