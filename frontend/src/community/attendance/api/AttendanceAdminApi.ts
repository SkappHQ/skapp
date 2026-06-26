import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rejects } from "assert";

import authFetch from "~community/common/utils/axiosInterceptor";

import { AttendanceConfigurationType } from "../types/attendanceTypes";
import {
  adminAttendanceEndpoints,
  managerAttendanceEndpoints
} from "./utils/attendanceEndPoints";
import { attendanceQueryKeys } from "./utils/attendanceQueryKeys";

export const useGetAttendanceConfiguration = () => {
  return useQuery({
    queryKey: attendanceQueryKeys.getAttendanceConfiguration(),
    queryFn: async () => {
      const url = adminAttendanceEndpoints.ADMIN_ATTENDANCE_CONFIGURATION;
      const result = await authFetch.get(url);

      return result?.data?.results[0];
    }
    // TO DO: add onError if need
  });
};

const updateAttendanceConfiguration = async (
  attendanceConfig: AttendanceConfigurationType
) => {
  const url = adminAttendanceEndpoints.ADMIN_ATTENDANCE_CONFIGURATION;
  const result = await authFetch.patch(url, attendanceConfig);
  return result?.data;
};

export const useUpdateAttendanceConfiguration = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAttendanceConfiguration,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: attendanceQueryKeys.getAttendanceConfiguration()
        })
        .catch(rejects);
      onSuccess();
    },
    onError
  });
};

export const useGetIndividualUtilization = (
  employeeId: number,
  isEnable: boolean = true
) => {
  return useQuery({
    queryKey: attendanceQueryKeys.getIndividualUtilization(employeeId),
    queryFn: async () => {
      const url = managerAttendanceEndpoints.INDIVIDUAL_UTILIZATION(employeeId);
      const result = await authFetch.get(url);
      return result?.data?.results[0];
    },
    enabled: isEnable
  });
};
