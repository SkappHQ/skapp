import { useQuery } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import {
  employeeLeaveReportPreProcessor,
  fullReportPreProcessor
} from "../actions/LeaveReportDataPreProcessor";
import { useLeaveStore } from "../store/store";
import { analyticAPIs } from "./utils/ApiEndpoints";
import { reportsQueryKeys } from "./utils/QueryKeys";

export const useGetEmployeeLeaveReport = (
  year: string,
  leaveTypeId: string[],
  teamId: string,
  page: number,
  size: number,
  sortKey: string,
  sortOrder: string,
  isEnabled: boolean = true
) => {
  const filterIds = useLeaveStore((state) => state.reportsFilterOrderIds);
  const { data, isLoading, isSuccess } = useQuery({
    enabled: isEnabled,
    queryKey: reportsQueryKeys.getEmployeeLeaveReportByAdmin(
      year,
      leaveTypeId,
      teamId,
      page,
      size,
      sortKey,
      sortOrder
    ),
    queryFn: async () => {
      return await authFetch.get(
        analyticAPIs.EMPLOYEELEAVEREPORT(
          year,
          leaveTypeId,
          teamId,
          page,
          size,
          sortKey,
          sortOrder
        )
      );
    }
  });
  if (!isLoading && isSuccess) {
    const preProcessedData = employeeLeaveReportPreProcessor(
      data?.data?.results?.[0],
      filterIds
    );
    return preProcessedData;
  }
};

export const useGetEmployeeLeaveReportCSV = (
  year: string,
  leaveTypeIds: string[],
  teamId: string,
  headerLabels: string[],
  leaveStatues: string[],
  isEnabled: boolean = true
) => {
  const { data, isLoading, isSuccess } = useQuery({
    enabled: isEnabled,
    queryKey: reportsQueryKeys.getEmployeeLeaveReportCSV(
      year,
      leaveTypeIds,
      teamId,
      leaveStatues
    ),
    queryFn: async () => {
      return await authFetch.get(
        analyticAPIs.EMPLOYEELEAVEREPORTCSV(
          year,
          leaveTypeIds,
          teamId,
          leaveStatues
        )
      );
    }
  });
  if (!isLoading && isSuccess) {
    const preProcessedData = fullReportPreProcessor(
      data?.data?.results?.[0],
      headerLabels
    );
    return preProcessedData;
  }
};

export const useGetEmployeeCustomAllocationReport = (
  year: string,
  teamId: string,
  page: number,
  size: number,
  sortKey: string,
  sortOrder: string,
  leaveTypeId: string[],
  isEnabled: boolean = true
) => {
  return useQuery({
    enabled: isEnabled,
    queryKey: reportsQueryKeys.getEmployeeCustomAllocation(
      year,
      teamId,
      page,
      size,
      sortKey,
      sortOrder,
      leaveTypeId
    ),
    queryFn: async () => {
      return await authFetch.get(
        analyticAPIs.EMPLOYEECUSTOMALLOCATIONSREPORT(
          year,
          teamId,
          page,
          size,
          sortKey,
          sortOrder,
          leaveTypeId
        )
      );
    }
  });
};

export const useGetEmployeeLeaveRequestsReport = (
  year: string,
  teamId: string,
  page: number,
  size: number,
  sortKey: string,
  sortOrder: string,
  leaveTypeId: string[],
  leaveStatus: string[],
  isEnabled: boolean = true
) => {
  return useQuery({
    enabled: isEnabled,
    queryKey: reportsQueryKeys.getEmployeeLeaveRequests(
      year,
      teamId,
      page,
      size,
      sortKey,
      sortOrder,
      leaveTypeId,
      leaveStatus
    ),
    queryFn: async () => {
      return await authFetch.get(
        analyticAPIs.EMPLOYEELEAVEREQUESTSREPORT(
          year,
          teamId,
          page,
          size,
          sortKey,
          sortOrder,
          leaveTypeId,
          leaveStatus
        )
      );
    }
  });
};
