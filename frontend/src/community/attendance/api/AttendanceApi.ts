import {
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect } from "react";

import {
  attendanceDashboardEndpoints,
  attendanceEndpoints
} from "~community/attendance/api/utils/attendanceEndPoints";
import { invalidateAttendanceTimeRecordQueries } from "~community/attendance/api/utils/invalidateAttendanceQueries";
import {
  getAttendanceDashboardQueryKeys,
  getAttendanceQueryKeys
} from "~community/attendance/api/utils/queryKeys";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  AttendanceSlotType,
  TimeRecordResponse
} from "~community/attendance/types/attendanceTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  convertDateToUTC,
  formatDateToISOString,
  formatDateWithOrdinalIndicator
} from "~community/common/utils/dateTimeUtils";
import { DefaultDayCapacityType } from "~community/configurations/types/TimeConfigurationsTypes";
import { EmployeeDataResponse } from "~community/people/types/EmployeeTypes";

import { graphDataPreprocessor } from "../actions/attendanceDashboardPreProcessor";
import { getLeaveDuration, isLeaveApplicable } from "../utils/LeaveStatusUtils";

export const updateStatus = async (
  slotType: AttendanceSlotType
): Promise<AxiosResponse> => {
  return await authFetch.post(attendanceEndpoints.UPDATE_EMPLOYEE_STATUS(), {
    recordActionType: slotType,
    time: convertDateToUTC(new Date().toISOString())
  });
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      invalidateAttendanceTimeRecordQueries(queryClient);
    }
  });
};

export const useGetEmployeeStatus = () => {
  const setAttendanceParams = useAttendanceStore(
    (state) => state.setAttendanceParams
  );
  //const { setGeneralErrors } = useGeneralErrors();
  const query = useQuery({
    queryKey: getAttendanceQueryKeys.employeeStatus(),
    queryFn: async () => {
      return await authFetch.get(attendanceEndpoints.GET_EMPLOYEE_STATUS());
    }
  });

  const { data, isSuccess } = query;

  useEffect(() => {
    if (isSuccess && data) {
      const response = data;
      if (response?.data?.results?.length) {
        const params = response?.data?.results[0];
        setAttendanceParams("slotType", params?.periodType);
        setAttendanceParams("slotStartTime", params?.starTime);
        setAttendanceParams("breakHours", params?.breakHours);
        setAttendanceParams("workHours", params?.workHours);
      } else {
        setAttendanceParams("slotType", AttendanceSlotType.READY);
      }
    }
  }, [isSuccess, data, setAttendanceParams]);
  return query;
};

export const useGetIncompleteClockOuts = () => {
  return useQuery({
    queryKey: getAttendanceQueryKeys.incompleteClockOuts(),
    queryFn: async () => {
      const result = await authFetch.get(
        attendanceEndpoints.GET_INCOMPLETE_CLOCKOUTS()
      );
      return (result?.data?.results?.[0] as TimeRecordResponse) ?? null;
    },
    enabled: false
  });
};

export const useUpdateIncompleteClockOuts = () => {
  return useMutation({
    mutationFn: async ({ id, time }: { id: number; time: string }) => {
      const result = await authFetch.patch(
        attendanceEndpoints.UPDATE_INCOMPLETE_CLOCKOUTS(id),
        {
          clockOutTime: time
        }
      );
      return result;
    }
  });
};

export const useGetAttendanceDashboardAnalytics = (
  teams: string | number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey:
      getAttendanceDashboardQueryKeys.attendanceDashboardAnalytics(teams),
    queryFn: async () => {
      const url =
        attendanceDashboardEndpoints.GET_ATTENDANCE_DASHBOARD_ANALYTICS();
      return await authFetch.get(url, {
        params: {
          teams
        }
      });
    },
    select(response) {
      return response?.data?.results?.[0] ?? null;
    },
    enabled
  });
};

export const useGetClockInOutGraphData = (
  recordType: string,
  teams: number | string,
  timeOffset: string,
  date: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getAttendanceDashboardQueryKeys.clockInOutGraphData({
      recordType,
      teams,
      timeOffset,
      date
    }),
    queryFn: async () => {
      const url = attendanceDashboardEndpoints.GET_CLOCK_IN_OUT_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          recordType,
          teams,
          timeOffset,
          date
        }
      });
    },
    select(response) {
      return graphDataPreprocessor(response?.data?.results?.[0] ?? null);
    },
    enabled
  });
};

export const useGetLateArrivalsGraphData = (
  teams: number | string,
  trendPeriod: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getAttendanceDashboardQueryKeys.lateArrivalsGraphData({
      teams,
      trendPeriod
    }),
    queryFn: async () => {
      const url = attendanceDashboardEndpoints.GET_LATE_ARRIVALS_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          teams,
          trendPeriod
        }
      });
    },
    select(response) {
      return graphDataPreprocessor(response?.data?.results?.[0] ?? null);
    },
    enabled
  });
};

export const useGetWorkHourGraphData = (
  month: string,
  teams: number | string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: getAttendanceDashboardQueryKeys.workHoursGraphData({
      month,
      teams
    }),
    queryFn: async () => {
      const url = attendanceDashboardEndpoints.GET_WORK_HOURS_GRAPH_DATA();
      return await authFetch.get(url, {
        params: {
          month,
          teams
        }
      });
    },
    select(response) {
      return graphDataPreprocessor(response?.data?.results?.[0] ?? null);
    },
    enabled
  });
};

export const useGetClockInData = (
  teams: string | number,
  clockInType: string,
  date: string,
  searchKeyword: string,
  enabled = true
): UseInfiniteQueryResult<EmployeeDataResponse> => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: getAttendanceDashboardQueryKeys.clockInSummaryData({
      teams,
      clockInType,
      date,
      searchKeyword
    }),
    enabled,
    queryFn: async ({ pageParam = 0 }) => {
      const url = attendanceDashboardEndpoints.GET_CLOCK_IN_SUMMARY();
      const employeeData = await authFetch.get(url, {
        params: {
          page: pageParam,
          teams,
          clockInType,
          date,
          searchKeyword
        }
      });

      return employeeData?.data?.results;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage?.currentPage && firstPage?.currentPage > 0) {
        return firstPage?.currentPage - 1;
      }
      return undefined;
    },
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage?.currentPage < lastPage?.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    }
  });
};

export const useGetEmployeeLeaveStatus = (
  timeConfigData: DefaultDayCapacityType
) => {
  const setAttendanceLeaveStatus = useAttendanceStore(
    (state) => state.setAttendanceLeaveStatus
  );
  const currentDate = new Date();
  const formattedDate = formatDateToISOString(currentDate);
  const currentHour = currentDate.getHours();

  const query = useQuery({
    queryKey: [getAttendanceQueryKeys.employeeLeaveStatus(), formattedDate],
    queryFn: async () => {
      return await authFetch.get(
        attendanceEndpoints.GET_EMPLOYEE_LEAVE_STATUS(formattedDate)
      );
    }
  });

  const { data, isSuccess } = query;

  useEffect(() => {
    if (isSuccess && data) {
      const response = data;
      if (response?.data.results.length !== 0) {
        const params = response?.data.results[0];
        if (
          isLeaveApplicable(
            getLeaveDuration(params?.leaveState),
            currentHour,
            timeConfigData
          )
        ) {
          setAttendanceLeaveStatus("onLeave", true);
          setAttendanceLeaveStatus(
            "duration",
            getLeaveDuration(params?.leaveState)
          );
          setAttendanceLeaveStatus(
            "date",
            formatDateWithOrdinalIndicator(new Date(params?.startDate))
          );
          setAttendanceLeaveStatus("leaveName", params?.leaveType?.name);
          setAttendanceLeaveStatus("leaveIcon", params?.leaveType?.emojiCode);
        } else {
          setAttendanceLeaveStatus("onLeave", false);
          setAttendanceLeaveStatus("duration", "");
          setAttendanceLeaveStatus("date", "");
          setAttendanceLeaveStatus("leaveName", "");
          setAttendanceLeaveStatus("leaveIcon", "");
        }
      }
    }
  }, [isSuccess, data, setAttendanceLeaveStatus]);
  return query;
};
