import { SetType } from "~community/common/types/storeTypes";

interface OnLeaveModalSliceTypes {
  isOnLeaveModalOpen: boolean;
  onLeaveModalTitle: string;
  todaysAvailability: any[];
  setIsOnLeaveModalOpen: (value: boolean) => void;
  setOnLeaveModalTitle: (value: string) => void;
  setTodaysAvailability: (value: any[]) => void;
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
  setTodaysAvailability: (value: any[]) =>
    set((state: OnLeaveModalSliceTypes) => ({
      ...state,
      todaysAvailability: value
    }))
});
