import { EpAddTimeRecordDto } from "~enterprise/attendance/api/AttendanceApi";

export const useUpdateEmployeeStatusWithLocation = () => {
  return {
    mutate: (_: EpAddTimeRecordDto) => {},
    isPending: false
  };
};

export interface UserGeofenceStatus {
  isGeofenceConfigured: boolean;
}

export const useGetUserGeofenceStatus = (_enabled: boolean = true) => {
  return {
    data: { isGeofenceConfigured: false } as UserGeofenceStatus,
    isLoading: false,
    isError: false
  };
};
