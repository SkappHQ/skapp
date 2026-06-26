import { ClockInSummarySliceType } from "~community/attendance/types/attendanceSliceTypes";
import { SetType } from "~community/common/types/storeTypes";

export const clockInSummarySlice = (
  set: SetType<ClockInSummarySliceType>
): ClockInSummarySliceType => ({
  clockInType: {},
  setClockInType: (type: { [key: string]: (string | number)[] }) =>
    set((state: ClockInSummarySliceType) => ({
      ...state,
      clockInType: type
    }))
});
