import { useCallback } from "react";

import { useUpdateEmployeeStatus } from "~community/attendance/api/AttendanceApi";
import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";
import { isEnterpriseMode } from "~community/common/utils/commonUtil";
import { useRecordAttendance as useEpRecordAttendance } from "~enterprise/attendance/hooks/useRecordAttendance";

const useCommunityRecordAttendance = (
  _onError?: () => void
): {
  recordAttendance: (slotType: AttendanceSlotType) => void;
  isPending: boolean;
} => {
  const { isPending, mutate } = useUpdateEmployeeStatus();

  const recordAttendance = useCallback(
    (slotType: AttendanceSlotType) => {
      mutate(slotType);
    },
    [mutate]
  );

  return {
    recordAttendance,
    isPending
  };
};

export const useRecordAttendance = (
  onError?: () => void
): {
  recordAttendance: (slotType: AttendanceSlotType) => void;
  isPending: boolean;
} => {
  const communityResult = useCommunityRecordAttendance(onError);
  const enterpriseResult = useEpRecordAttendance(onError);

  if (isEnterpriseMode()) {
    return enterpriseResult;
  }

  return communityResult;
};
