import { create } from "zustand";

import { terminationAlertModalSlice } from "./terminationAlertSlice";

describe("terminationAlertModalSlice", () => {
  it("should set isTerminationAlertModalOpen correctly", () => {
    const useStore = create(terminationAlertModalSlice);
    const { setTerminationAlertModalOpen } = useStore.getState();

    setTerminationAlertModalOpen(true);
    expect(useStore.getState().isTerminationAlertModalOpen).toBe(true);

    setTerminationAlertModalOpen(false);
    expect(useStore.getState().isTerminationAlertModalOpen).toBe(false);
  });
});
