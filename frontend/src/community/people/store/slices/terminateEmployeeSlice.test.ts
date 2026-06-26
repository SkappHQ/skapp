import { create } from "zustand";

import { terminationConfirmationModalSlice } from "./terminateEmployeeSlice";

describe("terminationConfirmationModalSlice", () => {
  it("should set isTerminationConfirmationModalOpen correctly", () => {
    const useStore = create(terminationConfirmationModalSlice);
    const { setTerminationConfirmationModalOpen } = useStore.getState();

    setTerminationConfirmationModalOpen(true);
    expect(useStore.getState().isTerminationConfirmationModalOpen).toBe(true);

    setTerminationConfirmationModalOpen(false);
    expect(useStore.getState().isTerminationConfirmationModalOpen).toBe(false);
  });

  it("should set selectedEmployeeId correctly", () => {
    const useStore = create(terminationConfirmationModalSlice);
    const { setSelectedEmployeeId } = useStore.getState();

    setSelectedEmployeeId(123);
    expect(useStore.getState().selectedEmployeeId).toBe(123);

    setSelectedEmployeeId("456");
    expect(useStore.getState().selectedEmployeeId).toBe("456");
  });

  it("should set alertMessage correctly", () => {
    const useStore = create(terminationConfirmationModalSlice);
    const { setAlertMessage } = useStore.getState();

    setAlertMessage("Are you sure you want to terminate?");
    expect(useStore.getState().alertMessage).toBe(
      "Are you sure you want to terminate?"
    );
  });
});
