import { EpAddTimeRecordDto } from "~enterprise/attendance/api/AttendanceApi";

export const useUpdateEmployeeStatusWithLocation = () => {
  return {
    mutate: (_: EpAddTimeRecordDto) => {},
    isPending: false
  };
};

export interface UserGeofenceStatus {
  geofenceConfigured: boolean;
}

export const useGetUserGeofenceStatus = (_enabled: boolean = true) => {
  return {
    data: { geofenceConfigured: false } as UserGeofenceStatus
  };
};
