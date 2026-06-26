import { create } from "zustand";

import { userDeletionModalSlice } from "./userDeletionSlice";

describe("userDeletionModalSlice", () => {
  it("should set isDeletionConfirmationModalOpen correctly", () => {
    const useStore = create(userDeletionModalSlice);
    const { setDeletionConfirmationModalOpen } = useStore.getState();

    setDeletionConfirmationModalOpen(true);
    expect(useStore.getState().isDeletionConfirmationModalOpen).toBe(true);

    setDeletionConfirmationModalOpen(false);
    expect(useStore.getState().isDeletionConfirmationModalOpen).toBe(false);
  });

  it("should set isDeletionAlertOpen correctly", () => {
    const useStore = create(userDeletionModalSlice);
    const { setDeletionAlertOpen } = useStore.getState();

    setDeletionAlertOpen(true);
    expect(useStore.getState().isDeletionAlertOpen).toBe(true);

    setDeletionAlertOpen(false);
    expect(useStore.getState().isDeletionAlertOpen).toBe(false);
  });

  it("should set deletionAlertMessage correctly", () => {
    const useStore = create(userDeletionModalSlice);
    const { setDeletionAlertMessage } = useStore.getState();

    setDeletionAlertMessage("User deletion failed.");
    expect(useStore.getState().deletionAlertMessage).toBe(
      "User deletion failed."
    );

    setDeletionAlertMessage("");
    expect(useStore.getState().deletionAlertMessage).toBe("");
  });
});
