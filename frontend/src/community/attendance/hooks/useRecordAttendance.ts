import { useCallback } from "react";

import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { getCurrentLocation } from "~community/attendance/utils/geolocationUtils";
import { appModes } from "~community/common/constants/configs";
import { convertDateToUTC } from "~community/common/utils/dateTimeUtils";
import {
  useGetUserGeofenceStatus,
  useUpdateEmployeeStatusWithLocation
} from "~enterprise/attendance/api/AttendanceApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

export const useRecordAttendance = (
  onError?: () => void
): {
  recordAttendance: (slotType: AttendanceSlotType) => void;
  isPending: boolean;
} => {
  const { isPending, mutate } = useUpdateEmployeeStatus();
  const { mutate: mutateWithLocation, isPending: isEpPending } =
    useUpdateEmployeeStatusWithLocation(onError);

  const environment = useGetEnvironment();
  const isEnterprise = environment === appModes.ENTERPRISE;

  const { data: attendanceConfig } = useGetAttendanceConfiguration();
  const isGeoFencingEnabled: boolean = attendanceConfig?.isGeoFencingEnabled;

  const {
    data: geofenceStatus,
    isLoading: isGeofenceStatusLoading,
    isError: isGeofenceStatusError
  } = useGetUserGeofenceStatus(isGeoFencingEnabled && isEnterprise);
  const isGeofenceConfigured = geofenceStatus?.isGeofenceConfigured;

  const recordAttendance = useCallback(
    (slotType: AttendanceSlotType) => {
      if (isGeoFencingEnabled && isEnterprise) {
        if (isGeofenceStatusError) {
          onError?.();
          return;
        }
        if (isGeofenceConfigured) {
          getCurrentLocation().then(({ latitude, longitude }) => {
            mutateWithLocation({
              recordActionType: slotType,
              time: convertDateToUTC(new Date().toISOString()) as string,
              latitude,
              longitude
            });
          });
          return;
        }
      }
      mutate(slotType);
    },
    [
      isGeoFencingEnabled,
      isEnterprise,
      isGeofenceStatusError,
      isGeofenceConfigured,
      mutateWithLocation,
      mutate,
      onError
    ]
  );

  return {
    recordAttendance,
    isPending: isPending || isEpPending || isGeofenceStatusLoading
  };
};
