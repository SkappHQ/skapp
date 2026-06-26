import { useCallback } from "react";

import { useGetAttendanceConfiguration } from "~community/attendance/api/AttendanceAdminApi";
import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { getCurrentLocation } from "~community/attendance/utils/geolocationUtils";
import { appModes } from "~community/common/constants/configs";
import { convertDateToUTC } from "~community/common/utils/dateTimeUtils";
import { useUpdateEmployeeStatusWithLocation } from "~enterprise/attendance/api/AttendanceApi";
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
  const isGeoFencingEnabled = attendanceConfig?.isGeoFencingEnabled;

  const recordAttendance = useCallback(
    (slotType: AttendanceSlotType) => {
      if (isGeoFencingEnabled && isEnterprise) {
        getCurrentLocation().then(({ latitude, longitude }) => {
          mutateWithLocation({
            recordActionType: slotType,
            time: convertDateToUTC(new Date().toISOString()) as string,
            latitude,
            longitude
          });
        });
      } else {
        mutate(slotType);
      }
    },
    [isGeoFencingEnabled, isEnterprise, mutateWithLocation, mutate]
  );

  return {
    recordAttendance,
    isPending: isPending || isEpPending
  };
};
