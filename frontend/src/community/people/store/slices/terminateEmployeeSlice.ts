import { SetType } from "~community/common/types/storeTypes";

interface TerminationConfirmationModalSliceType {
  isTerminationConfirmationModalOpen: boolean;
  isReactivationConfirmationModalOpen: boolean;
  selectedEmployeeId: string | number;
  alertMessage: string;
  setAlertMessage: (value: string) => void;
  setTerminationConfirmationModalOpen: (value: boolean) => void;
  setReactivationConfirmationModalOpen: (value: boolean) => void;
  setSelectedEmployeeId: (value: string | number) => void;
}

export const terminationConfirmationModalSlice = (
  set: SetType<TerminationConfirmationModalSliceType>
): TerminationConfirmationModalSliceType => ({
  isTerminationConfirmationModalOpen: false,
  isReactivationConfirmationModalOpen: false,
  selectedEmployeeId: 0,
  alertMessage: "",
  setTerminationConfirmationModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isTerminationConfirmationModalOpen: value
    })),
  setReactivationConfirmationModalOpen: (value: boolean) =>
    set((state) => ({
      ...state,
      isReactivationConfirmationModalOpen: value
    })),
  setSelectedEmployeeId: (value: string | number) =>
    set((state) => ({ ...state, selectedEmployeeId: value })),

  setAlertMessage: (value: string) =>
    set((state) => ({ ...state, alertMessage: value }))
});
