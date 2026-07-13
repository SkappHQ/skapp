import { useCallback } from "react";

import { AttendanceSlotType } from "~community/attendance/types/attendanceTypes";

export const useRecordAttendance = (
  _onError?: () => void
): {
  recordAttendance: (slotType: AttendanceSlotType) => void;
  isPending: boolean;
} => {
  return {
    recordAttendance: useCallback((_slotType: AttendanceSlotType) => {}, []),
    isPending: false
  };
};
