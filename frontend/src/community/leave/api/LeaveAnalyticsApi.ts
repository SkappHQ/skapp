import { useQuery } from "@tanstack/react-query";

import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  convertDateToFormat,
  getStartAndEndOfYear
} from "~community/common/utils/dateTimeUtils";

import { leaveTypeBreakdownPreProcessor } from "../actions/LeaveTypeBreakdownPreProcessor";
import { LeaveType } from "../types/CustomLeaveAllocationTypes";
import { leaveAnalyticsEndpoints } from "./utils/ApiEndpoints";
import { leaveAnalyticsQueryKeys } from "./utils/QueryKeys";

export const useGetEmployeeEntitlements = (
  employeeId: number,
  isEnabled: boolean = true
) => {
  return useQuery({
    enabled: isEnabled,
    queryKey:
      leaveAnalyticsQueryKeys.EMPLOYEE_LEAVE_ENTITLEMENTS_FOR_ANALYTICS(
        employeeId
      ),
    queryFn: () =>
      authFetch.get(
        leaveAnalyticsEndpoints.GET_EMPLOYEE_LEAVE_ENTITLEMENTS(employeeId)
      ),
    select: (data) => {
      return data.data.results ?? [];
    }
  });
};

export const useGetEmployeeLeaveHistory = (
  employeeId: number,
  selectedDates: Date[],
  status: string[],
  type: string[],
  page: number,
  size: number,
  isExport: boolean,
  isEnabled: boolean
) => {
  const { startDateOfYear: startDate, endDateOfYear: endDate } =
    getStartAndEndOfYear(DATE_FORMAT);

  return useQuery({
    enabled: isEnabled,
    queryKey: leaveAnalyticsQueryKeys.EMPLOYEE_LEAVE_HISTORY(
      employeeId,
      selectedDates,
      status,
      type,
      page,
      size,
      isExport,
      selectedDates[0],
      startDate,
      selectedDates[1],
      endDate
    ),
    queryFn: async () => {
      const apiUrl = leaveAnalyticsEndpoints.EMPLOYEE_LEAVE_HISTORY(employeeId);

      const response = await authFetch.get(apiUrl, {
        params: {
          startDate: selectedDates[0]
            ? convertDateToFormat(selectedDates[0], "yyyy-MM-dd")
            : startDate,
          endDate: selectedDates[1]
            ? convertDateToFormat(selectedDates[1], "yyyy-MM-dd")
            : endDate,
          leaveType: type ? type.join(",") : undefined,
          status: status ? status.join(",") : undefined,
          isExport,
          page: page.toString(),
          size: size.toString()
        }
      });

      return response?.data?.results[0] || [];
    }
  });
};

export const GetLeaveUtilizationChartDetails = (
  employeeId: number,
  leaveTypes: LeaveType[],
  isEnabled: boolean = true
) => {
  const typeIdArray = leaveTypes.map((item) => item.typeId);
  const { startDateOfYear: startDate, endDateOfYear: endDate } =
    getStartAndEndOfYear(DATE_FORMAT);

  return useQuery({
    enabled: isEnabled,
    queryKey: leaveAnalyticsQueryKeys.LEAVE_TYPE_UTILIZATION(
      employeeId,
      startDate,
      endDate
    ),
    queryFn: async () => {
      const apiUrl = leaveAnalyticsEndpoints.LEAVE_UTILIZATION_CHART();
      const response = await authFetch.get(apiUrl, {
        params: {
          employeeId,
          startDate,
          endDate,
          leaveTypeIds: typeIdArray.join(",")
        }
      });
      return response;
    },
    select: (leaveUtilizationResponse) => {
      return leaveTypeBreakdownPreProcessor(
        leaveUtilizationResponse?.data?.results?.[0]
      );
    }
  });
};
