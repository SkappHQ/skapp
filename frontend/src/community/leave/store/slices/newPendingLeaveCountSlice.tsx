import { SetType } from "~community/common/types/storeTypes";
import { NewPendingLeaveCountSliceType } from "~community/leave/types/SliceTypes";

export const newPendingLeaveCountSlice = (
  set: SetType<NewPendingLeaveCountSliceType>
): NewPendingLeaveCountSliceType => ({
  viewedPendingLeaveCount: 0,
  pendingLeaveCount: 0,
  setViewedPendingLeaveCount: (count: number) =>
    set((state) => ({ ...state, viewedPendingLeaveCount: count })),
  setPendingLeaveCount: (count: number) =>
    set((state) => ({ ...state, pendingLeaveCount: count }))
});
