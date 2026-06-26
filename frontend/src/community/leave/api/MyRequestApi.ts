import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { rejects } from "assert";

import { getAttendanceQueryKeys } from "~community/attendance/api/utils/queryKeys";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { getYearStartAndEndDates } from "~community/common/utils/dateTimeUtils";
import {
  leaveEndPoints,
  leaveEntitlementEndPoints,
  myRequestsEndPoints
} from "~community/leave/api/utils/ApiEndpoints";
import {
  leaveEntitlementQueryKeys,
  leaveQueryKeys,
  myRequestsQueryKeys
} from "~community/leave/api/utils/QueryKeys";
import { LeaveEntitlementBalanceType } from "~community/leave/types/LeaveEntitlementTypes";
import {
  LeaveRequestPayloadType,
  MyLeaveRequestPayloadType,
  ResourceAvailabilityParamTypes,
  ResourceAvailabilityPayload
} from "~community/leave/types/MyRequests";

import { useLeaveStore } from "../store/store";
import { LeaveRequestItemsType } from "../types/LeaveRequestTypes";

export const useGetLeaveAllocation = (selectedYear: string) => {
  return useQuery({
    queryKey: [leaveEntitlementQueryKeys.MY_LEAVE_ALLOCATION, selectedYear],
    queryFn: async () => {
      const dateRange = getYearStartAndEndDates(Number(selectedYear));
      const response = await authFetch.get(
        leaveEntitlementEndPoints.GET_LEAVE_ALLOCATIONS(
          dateRange.start as string,
          dateRange.end as string
        )
      );
      return response;
    },
    select: (response) => {
      return response?.data?.results;
    },
    enabled: true
  });
};

export const useGetResourceAvailability = ({
  teams,
  startDate,
  endDate
}: ResourceAvailabilityParamTypes): UseQueryResult<
  ResourceAvailabilityPayload[]
> => {
  const isEnabled: boolean = teams !== null && !!startDate && !!endDate;

  return useQuery({
    queryKey: myRequestsQueryKeys.RESOURCE_AVAILABILITY(
      teams,
      startDate,
      endDate
    ),
    queryFn: async () =>
      await authFetch.get(myRequestsEndPoints.RESOURCE_AVAILABILITY, {
        params: {
          teams,
          startDate,
          endDate
        }
      }),
    select: (response) => {
      return response?.data?.results ?? [];
    },
    enabled: isEnabled
  });
};

export const useGetMyRequests = ({
  isExport = false
}: {
  isExport: boolean;
}): UseQueryResult<MyLeaveRequestPayloadType[]> => {
  return useQuery({
    queryKey: myRequestsQueryKeys.MY_REQUESTS(isExport),
    queryFn: async () => {
      const response = await authFetch.get(
        myRequestsEndPoints.GET_MY_REQUESTS,
        {
          params: {
            isExport: isExport
          }
        }
      );
      return response;
    },
    select: (response) => {
      return response?.data?.results?.[0].items ?? [];
    }
  });
};

export const useGetLeaveEntitlementBalance = (
  id: number
): UseQueryResult<LeaveEntitlementBalanceType[]> => {
  return useQuery({
    queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENT_BALANCE(id),
    queryFn: async () =>
      await authFetch.get(
        leaveEntitlementEndPoints.GET_MY_LEAVE_ENTITLEMENT_BALANCE(id)
      ),
    select: (response) => {
      return response?.data?.results;
    }
  });
};

export const useApplyLeave = (
  selectedYear: string,
  onSuccess: (data: LeaveRequestItemsType) => void,
  onError: (error: string) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveRequestData: LeaveRequestPayloadType) => {
      const response = await authFetch.post(
        myRequestsEndPoints.APPLY_LEAVE,
        leaveRequestData
      );
      return response.data.results[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [leaveEntitlementQueryKeys.MY_LEAVE_ALLOCATION, selectedYear]
      });
      queryClient.invalidateQueries({
        queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_REQUESTS]
      });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error.response.data.results[0]?.messageKey || "");
    }
  });
};

export const useGetEmployeeLeaveRequests = () => {
  const params = useLeaveStore((state) => state.leaveRequestParams);

  return useQuery({
    queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_REQUESTS, params],
    queryFn: async () => {
      const url = leaveEndPoints.LEAVES;
      const response = await authFetch.get(url, { params });
      return response;
    },
    select: (response) => {
      return response?.data?.results[0];
    }
  });
};

export const useGetEmployeeLeaveRequestData = (leaveId: number) => {
  return useQuery({
    queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_REQUEST_DATA, leaveId],
    queryFn: async () => {
      const url = leaveEndPoints.SPECIFIC_LEAVE(leaveId);
      const response = await authFetch.get(url);
      return response.data.results[0];
    },
    enabled: false
  });
};

export const useCancelLeaveRequest = (selectedYear: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveRequestId: { id: number }) => {
      return await authFetch.delete(
        leaveEndPoints.SPECIFIC_LEAVE(leaveRequestId.id)
      );
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_REQUESTS]
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_ALLOCATION]
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: [leaveQueryKeys.EMPLOYEE_LEAVE_REQUEST_DATA]
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: [getAttendanceQueryKeys.employeeLeaveStatus()]
        })
        .catch(rejects);
      queryClient
        .invalidateQueries({
          queryKey: [
            leaveEntitlementQueryKeys.MY_LEAVE_ALLOCATION,
            selectedYear
          ]
        })
        .catch(rejects);
    }
  });
};

export const useNudgeManager = () => {
  return useMutation({
    mutationFn: async (leaveRequestId: { id: number }) => {
      return await authFetch.get(
        leaveEndPoints.NUDGE_NOTIFICATIONS(leaveRequestId.id),
        {}
      );
    }
  });
};

export const useCheckLeaveAlreadyNudged = (leaveId: number) => {
  return useQuery({
    queryKey: [leaveQueryKeys.LEAVE_REQUEST_NUDGED, leaveId],
    queryFn: async () => {
      const url = leaveEndPoints.CHECK_NUDGED(leaveId);
      const response = await authFetch.get(url);
      return response.data.results[0];
    },
    enabled: !!leaveId
  });
};
