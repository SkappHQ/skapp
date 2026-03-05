import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rejects } from "assert";

import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { getStartAndEndOfYear } from "~community/common/utils/dateTimeUtils";
import { dashboardQueryKeys } from "~enterprise/common/api/utils/QueryKeys";

import { graphDataPreprocessor } from "../actions/attendanceDashboardPreProcessor";
import { useAttendanceStore } from "../store/attendanceStore";
import { managerAttendanceEndpoints } from "./utils/attendanceEndPoints";
import { attendanceQueryKeys } from "./utils/attendanceQueryKeys";
import {
  timeRecordPreProcessor,
  timeRequestPreProcessor
} from "./utils/preProcessors";

export const useGetManagerWorkSummary = () => {
  const timesheetAnalyticsParams = useAttendanceStore(
    (state) => state.timesheetAnalyticsParams
  );
  const { startDate, endDate, teamId } = timesheetAnalyticsParams;
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear(DATE_FORMAT);
  return useQuery({
    queryKey: attendanceQueryKeys.getManagerWorkSummary({
      startDate: startDate,
      endDate: endDate,
      teamId,
      startDateOfYear,
      endDateOfYear
    }),
    queryFn: async () => {
      const url = managerAttendanceEndpoints.MANAGER_WORK_SUMMARY;
      return await authFetch.get(url, {
        params: {
          startDate: startDate || startDateOfYear,
          endDate: endDate || endDateOfYear,
          teamIds: teamId
        }
      });
    },
    select(response) {
      return response?.data?.results?.[0];
    }
  });
};

export const useGetManagerTimeRecords = (isExport: boolean = false) => {
  const timesheetAnalyticsParams = useAttendanceStore(
    (state) => state.timesheetAnalyticsParams
  );
  const { startDate, endDate, page, size, teamId } = timesheetAnalyticsParams;
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear(DATE_FORMAT);
  return useQuery({
    queryKey: attendanceQueryKeys.getManagerRecords({
      startDate: startDate,
      endDate: endDate,
      page,
      size,
      isExport,
      teamId,
      startDateOfYear,
      endDateOfYear
    }),
    queryFn: async () => {
      const url = managerAttendanceEndpoints.MANAGER_RECORDS;
      return await authFetch.get(url, {
        params: {
          startDate: startDate || startDateOfYear,
          endDate: endDate || endDateOfYear,
          page: page,
          size: size,
          sortOrder: SortOrderTypes.ASC,
          sortKey: SortKeyTypes.NAME,
          isExport,
          teamIds: teamId
        }
      });
    },
    select(response) {
      return timeRecordPreProcessor(response?.data.results?.[0]);
    }
  });
};

export const useGetManagerTimeSheetRequests = () => {
  const timesheetRequestParams = useAttendanceStore(
    (state) => state.timesheetRequestParams
  );
  const { startDate, endDate, page, size, status } = timesheetRequestParams;
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear(DATE_FORMAT);
  return useQuery({
    queryKey: attendanceQueryKeys.getManagerRequests({
      startDate: startDate,
      endDate: endDate,
      page: page - 1,
      size,
      status,
      startDateOfYear,
      endDateOfYear
    }),

    queryFn: async () => {
      const url = managerAttendanceEndpoints.MANAGER_REQUESTS;
      return await authFetch.get(url, {
        params: {
          startDate: startDate || startDateOfYear,
          endDate: endDate || endDateOfYear,
          pageNumber: page - 1,
          pageSize: size,
          status
        }
      });
    },
    select(response) {
      return timeRequestPreProcessor(response?.data?.results?.[0]);
    }
  });
};

export const useApproveDenyTimeRequest = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData: { id: number; status: string }) => {
      const url = managerAttendanceEndpoints.MANAGER_APPROVE_DENY_REQUESTS(
        requestData?.id
      );
      return await authFetch.patch(url, {
        status: requestData?.status
      });
    },
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: attendanceQueryKeys.getManagerRequests()
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: dashboardQueryKeys.GET_PENDING_COUNTS
        })
        .catch(rejects);
    },
    onError: () => {
      onError();
    }
  });
};

export const useGetIndividualWorkHourGraphData = (
  month: string,
  employeeId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: attendanceQueryKeys.individualWorkHoursGraphData(
      month,
      employeeId
    ),
    queryFn: async () => {
      const url =
        managerAttendanceEndpoints.GET_INDIVIDUAL_WORK_HOURS_GRAPH_DATA(
          employeeId
        );
      return await authFetch.get(url, {
        params: {
          month,
          employeeId
        }
      });
    },
    select(response) {
      return graphDataPreprocessor(response?.data?.results?.[0] ?? null);
    },
    enabled
  });
};
