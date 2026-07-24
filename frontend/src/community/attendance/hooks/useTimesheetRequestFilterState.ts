import { useEffect } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";

export const useTimesheetRequestFilterState = (
  isManager: boolean,
  shouldRegisterCleanup = true
) => {
  const {
    employeeTimesheetRequestsFilterValues,
    employeeTimesheetRequestsFilters,
    employeeTimesheetRequestSelectedDates,
    setEmployeeTimesheetRequestsFilters,
    setEmployeeTimesheetRequestSelectedDates,
    resetEmployeeTimesheetRequestParams,
    timesheetRequestsFilterValues,
    timesheetRequestsFilters,
    timesheetRequestSelectedDates,
    setTimesheetRequestsFilters,
    setTimesheetRequestSelectedDates,
    resetTimesheetRequestParams
  } = useAttendanceStore((state) => state);

  const filterValues = isManager
    ? timesheetRequestsFilterValues
    : employeeTimesheetRequestsFilterValues;
  const appliedStatus = isManager
    ? timesheetRequestsFilters.status
    : employeeTimesheetRequestsFilters.status;
  const appliedDates = isManager
    ? timesheetRequestSelectedDates
    : employeeTimesheetRequestSelectedDates;
  const setFilters = isManager
    ? setTimesheetRequestsFilters
    : setEmployeeTimesheetRequestsFilters;
  const setDates = isManager
    ? setTimesheetRequestSelectedDates
    : setEmployeeTimesheetRequestSelectedDates;
  const resetParams = isManager
    ? resetTimesheetRequestParams
    : resetEmployeeTimesheetRequestParams;

  const [appliedStartDate, appliedEndDate] = appliedDates;

  useEffect(() => {
    if (!shouldRegisterCleanup) return;
    return () => {
      resetParams();
      setDates(["", ""]);
    };
  }, [shouldRegisterCleanup, resetParams, setDates]);

  return {
    filterValues,
    appliedStatus,
    appliedDates,
    setFilters,
    setDates,
    resetParams,
    filterCount:
      appliedStatus.length + (appliedStartDate || appliedEndDate ? 1 : 0)
  };
};
