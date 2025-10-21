import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rejects } from "assert";

import { employeeAttendanceEndpoints } from "~community/attendance/api/utils/attendanceEndPoints";
import { attendanceQueryKeys } from "~community/attendance/api/utils/attendanceQueryKeys";
import {
  dailyLogPreProcessor,
  timeRequestPreProcessor
} from "~community/attendance/api/utils/preProcessors";
import { TimeSheetRequestStates } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  ManualEntryPayloadType,
  TimeAvailabilityType
} from "~community/attendance/types/timeSheetTypes";
import {
  convertToDateTime,
  convertToMilliseconds,
  convertToUtc
} from "~community/attendance/utils/TimeUtils";
import { DATE_FORMAT } from "~community/common/constants/timeConstants";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import {
  getLocalDate,
  getStartAndEndOfYear
} from "~community/common/utils/dateTimeUtils";

export const useGetTodaysTimeRequestAvailability = () => {
  //const { setGeneralErrors } = useGeneralErrors();
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  return useQuery({
    queryKey: attendanceQueryKeys.getEmployeeRequests({
      startDate: getLocalDate(new Date()),
      endDate: getLocalDate(nextDate),
      page: 1,
      size: 5,
      status: [
        TimeSheetRequestStates.PENDING,
        TimeSheetRequestStates.APPROVED
      ].toString()
    }),
    queryFn: async () => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_REQUESTS;
      return await authFetch.get(url, {
        params: {
          startDate: getLocalDate(new Date()),
          endDate: getLocalDate(nextDate),
          page: 1,
          size: 5,
          status: [
            TimeSheetRequestStates.PENDING,
            TimeSheetRequestStates.APPROVED
          ].toString(),
          startTime: convertToMilliseconds(
            convertToUtc(getLocalDate(new Date()))
          ),
          endTime: nextDate
            ? convertToMilliseconds(convertToUtc(getLocalDate(nextDate)))
            : null
        }
      });
    },
    select(response) {
      const timeRequests = timeRequestPreProcessor(
        response?.data?.results?.[0]
      );
      return timeRequests?.totalItems !== 0;
    }
    // onError: setGeneralErrors
  });
};

export const useGetPeriodAvailabilityMutation = (
  date: string,
  startTime: string,
  endTime: string,
  onSuccess: (data: TimeAvailabilityType) => void
) => {
  const fetchPeriodAvailability = async () => {
    const startDateTime = convertToDateTime(date, startTime);
    const endDateTime = convertToDateTime(date, endTime);
    const startUTC = convertToUtc(startDateTime);
    const endUTC = convertToUtc(endDateTime);
    const startTimestamp = convertToMilliseconds(startUTC);
    const endTimestamp = convertToMilliseconds(endUTC);

    return await authFetch.get(
      employeeAttendanceEndpoints.EMPLOYEE_PERIOD_AVAILABILITY,
      {
        params: {
          date,
          startTime: startTimestamp,
          endTime: endTimestamp
        }
      }
    );
  };

  return useMutation({
    mutationFn: fetchPeriodAvailability,
    onSuccess: (data) => onSuccess(data.data.results?.[0])
  });
};

export const useGetDailyLogs = (
  startDate: string,
  endDate: string,
  isEnable: boolean = true
) => {
  //const { setGeneralErrors } = useGeneralErrors();
  return useQuery({
    queryKey: attendanceQueryKeys.getEmployeeDailyLog(startDate, endDate),
    queryFn: async () => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_DAILY_LOG;
      return await authFetch.get(url, {
        params: {
          page: 0,
          size: 10,
          startDate,
          endDate,
          isExport: true,
          sortOrder: SortOrderTypes.ASC,
          sortKey: SortKeyTypes.DATE
        }
      });
    },
    select(data) {
      return dailyLogPreProcessor(data?.data?.results?.[0]?.items);
    },
    //onError: setGeneralErrors,
    enabled: isEnable
  });
};

export const useGetEmployeeWorkSummary = (
  startDate: string,
  endDate: string,
  isEnable: boolean = true
) => {
  //const { setGeneralErrors } = useGeneralErrors();
  return useQuery({
    queryKey: attendanceQueryKeys.getEmployeeWorkSummary(startDate, endDate),
    queryFn: async () => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_WORK_SUMMARY;
      return await authFetch.get(url, {
        params: {
          startDate,
          endDate
        }
      });
    },
    select(response) {
      return response?.data?.results?.[0];
    },
    // onError: setGeneralErrors,
    enabled: isEnable
  });
};

export const useGetTimeSheetRequests = () => {
  //const { setGeneralErrors } = useGeneralErrors();
  const employeeTimesheetRequestParams = useAttendanceStore(
    (state) => state.employeeTimesheetRequestParams
  );
  const { startDate, endDate, page, size, status } =
    employeeTimesheetRequestParams;
  const { startDateOfYear, endDateOfYear } = getStartAndEndOfYear(DATE_FORMAT);
  return useQuery({
    queryKey: attendanceQueryKeys.getEmployeeRequests({
      startDate: startDate,
      endDate: endDate,
      page,
      size,
      status,
      startOfYear: startDateOfYear,
      endOfYear: endDateOfYear
    }),
    queryFn: async () => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_REQUESTS;
      return await authFetch.get(url, {
        params: {
          startDate: startDate || startDateOfYear,
          endDate: endDate || endDateOfYear,
          status,
          pageNumber: page,
          pageSize: size,
          sortBy: SortOrderTypes.DESC,
          sortKey: SortKeyTypes.CREATION_DATE,
          startTime: startDate
            ? convertToMilliseconds(convertToUtc(startDate))
            : null,
          endTime: endDate ? convertToMilliseconds(convertToUtc(endDate)) : null
        }
      });
    },
    select(data) {
      return timeRequestPreProcessor(data?.data.results?.[0]);
    }
    //onError: setGeneralErrors
  });
};

export const useCancelTimeRequest = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData: { id: number; status: string }) => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_CANCEL_REQUEST;
      return await authFetch.patch(
        url,
        {},
        {
          params: {
            status: requestData?.status,
            timeRequestId: requestData?.id
          }
        }
      );
    },
    onSuccess: () => {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: attendanceQueryKeys.getEmployeeRequests()
        })
        .catch(rejects);
    },
    onError: () => {
      onError();
    }
  });
};

export const useAddManualTimeEntry = (
  onSuccess: () => void,
  onEnhancedError: (error: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ManualEntryPayloadType) => {
      const url = employeeAttendanceEndpoints.ADD_MANUAL_ENTRY;
      return await authFetch.post(url, data);
    },
    onError(error) {
      onEnhancedError(error);
    },
    onSuccess() {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: attendanceQueryKeys.getEmployeeRequests()
        })
        .catch(rejects);
    }
  });
};

export const useEditClockInOut = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ManualEntryPayloadType) => {
      const url = employeeAttendanceEndpoints.EDIT_CLOCK_IN_OUT;
      return await authFetch.patch(url, data);
    },
    onError() {
      onError();
    },
    onSuccess() {
      onSuccess();
      queryClient
        .invalidateQueries({
          queryKey: attendanceQueryKeys.getEmployeeRequests()
        })
        .catch(rejects);
    }
  });
};

export const useGetPeriodAvailability = (
  date: string,
  startTime: string,
  endTime: string
) => {
  const dateTimeFromTime = convertToDateTime(date, startTime);
  const dateTimeToTime = convertToDateTime(date, endTime);
  const timestampStartTime = convertToMilliseconds(
    convertToUtc(dateTimeFromTime)
  );
  const timestampEndTime = convertToMilliseconds(convertToUtc(dateTimeToTime));
  return useQuery({
    queryKey: [
      attendanceQueryKeys.getEmployeePeriodAvailability(
        date,
        startTime,
        endTime
      ),
      timestampStartTime,
      timestampEndTime
    ],
    queryFn: async () => {
      const url = employeeAttendanceEndpoints.EMPLOYEE_PERIOD_AVAILABILITY;
      return await authFetch.get(url, {
        params: {
          date,
          startTime: timestampStartTime,
          endTime: timestampEndTime
        }
      });
    },
    select(data) {
      return data?.data.results?.[0];
    },
    enabled: false
  });
};

export const useGetDailyLogsByEmployeeId = (
  startDate: string,
  endDate: string,
  employeeId: number,
  isEnabled: boolean = true
) => {
  return useQuery({
    enabled: isEnabled,
    queryKey: attendanceQueryKeys.getEmployeeDailyLogByEmployeeId(
      startDate,
      endDate,
      employeeId
    ),
    queryFn: async () => {
      const url =
        employeeAttendanceEndpoints.GET_EMPLOYEE_DAILY_LOG_BY_EMPLOYEE_ID(
          employeeId
        );

      return await authFetch.get(url, {
        params: {
          page: 0,
          size: 10,
          startDate,
          endDate,
          isExport: true,
          sortOrder: SortOrderTypes.ASC,
          sortKey: SortKeyTypes.DATE,
          employeeId
        }
      });
    },
    select(data) {
      return dailyLogPreProcessor(data?.data?.results?.[0]?.items);
    }
  });
};
