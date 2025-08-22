import { SetType } from "~community/common/types/storeTypes";
import { LeaveRequest } from "~community/leave/types/ResourceAvailabilityTypes";

interface OnLeaveModalSliceTypes {
  isOnLeaveModalOpen: boolean;
  onLeaveModalTitle: string;
  todaysAvailability: LeaveRequest[];
  setIsOnLeaveModalOpen: (value: boolean) => void;
  setOnLeaveModalTitle: (value: string) => void;
  setTodaysAvailability: (value: LeaveRequest[]) => void;
}

export const onLeaveModalSlice = (
  set: SetType<OnLeaveModalSliceTypes>
): OnLeaveModalSliceTypes => ({
  isOnLeaveModalOpen: false,
  onLeaveModalTitle: "",
  todaysAvailability: [],
  setIsOnLeaveModalOpen: (value: boolean) =>
    set((state: OnLeaveModalSliceTypes) => ({
      ...state,
      isOnLeaveModalOpen: value
    })),
  setOnLeaveModalTitle: (value: string) =>
    set((state: OnLeaveModalSliceTypes) => ({
      ...state,
      onLeaveModalTitle: value
    })),
  setTodaysAvailability: (value: LeaveRequest[]) =>
    set((state: OnLeaveModalSliceTypes) => ({
      ...state,
      todaysAvailability: value
    }))
});
