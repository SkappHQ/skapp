import { DirectManualTimeEntryVariablesType } from "~community/attendance/types/timeSheetTypes";
import { EpAddTimeRecordDto } from "~enterprise/attendance/api/AttendanceApi";

export const useUpdateEmployeeStatusWithLocation = () => {
  return {
    mutate: (_: EpAddTimeRecordDto) => {},
    isPending: false
  };
};

export const useAddDirectTimeEntry = () => {
  return {
    mutate: (_: DirectManualTimeEntryVariablesType) => {},
    isPending: false
  };
};

export const useEditDirectTimeEntry = () => {
  return {
    mutate: (_: DirectManualTimeEntryVariablesType) => {},
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
