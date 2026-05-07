import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface WorkLocationState {
  isDeleteModalOpen: boolean;
  selectedLocationId: number | null;
  isUnsavedChangesModalOpen: boolean;
  pendingNavigation: (() => void) | null;
  setIsDeleteModalOpen: (open: boolean) => void;
  setSelectedLocationId: (id: number | null) => void;
  setIsUnsavedChangesModalOpen: (open: boolean) => void;
  setPendingNavigation: (fn: (() => void) | null) => void;
}

export const useWorkLocationStore = create<
  WorkLocationState,
  [["zustand/devtools", never]]
>(
  devtools(
    (set) => ({
      isDeleteModalOpen: false,
      selectedLocationId: null,
      isUnsavedChangesModalOpen: false,
      pendingNavigation: null,
      setIsDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      setIsUnsavedChangesModalOpen: (open) =>
        set({ isUnsavedChangesModalOpen: open }),
      setPendingNavigation: (fn) => set({ pendingNavigation: fn })
    }),
    { name: "workLocationStore" }
  )
);
