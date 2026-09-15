import { DirectManualTimeEntryVariablesType } from "~community/attendance/types/timeSheetTypes";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { EpAddTimeRecordDto } from "~enterprise/attendance/api/AttendanceApi";

export const useUpdateEmployeeStatusWithLocation = () => {
  return {
    mutate: (_: EpAddTimeRecordDto) => {},
    isPending: false
  };
};

export const useAddDirectTimeEntry = (
  _onSuccess: () => void,
  _onError: (error: ErrorResponse) => void
) => {
  return {
    mutate: (_: DirectManualTimeEntryVariablesType) => {},
    isPending: false
  };
};

export const useEditDirectTimeEntry = (
  _onSuccess: () => void,
  _onError: (error: ErrorResponse) => void
) => {
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
