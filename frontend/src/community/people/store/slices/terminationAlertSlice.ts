import { SetType } from "~community/common/types/storeTypes";

interface TerminationAlertModalSliceType {
  isTerminationAlertModalOpen: boolean;
  setTerminationAlertModalOpen: (value: boolean) => void;
}

export const terminationAlertModalSlice = (
  set: SetType<TerminationAlertModalSliceType>
): TerminationAlertModalSliceType => ({
  isTerminationAlertModalOpen: false,
  setTerminationAlertModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isTerminationAlertModalOpen: value
    }))
});
