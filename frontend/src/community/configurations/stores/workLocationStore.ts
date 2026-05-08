import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface GeofenceTempState {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}

interface WorkLocationState {
  isDeleteModalOpen: boolean;
  selectedLocationId: number | null;
  isGeofenceModalOpen: boolean;
  tempGeofence: GeofenceTempState | null;
  setIsDeleteModalOpen: (open: boolean) => void;
  setSelectedLocationId: (id: number | null) => void;
  setIsGeofenceModalOpen: (open: boolean) => void;
  setTempGeofence: (geofence: GeofenceTempState | null) => void;
  updateTempGeofence: (partial: Partial<GeofenceTempState>) => void;
}

export const useWorkLocationStore = create<
  WorkLocationState,
  [["zustand/devtools", never]]
>(
  devtools(
    (set) => ({
      isDeleteModalOpen: false,
      selectedLocationId: null,
      isGeofenceModalOpen: false,
      tempGeofence: null,
      setIsDeleteModalOpen: (open) => set({ isDeleteModalOpen: open }),
      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      setIsGeofenceModalOpen: (open) => set({ isGeofenceModalOpen: open }),
      setTempGeofence: (geofence) => set({ tempGeofence: geofence }),
      updateTempGeofence: (partial) =>
        set((state) =>
          state.tempGeofence
            ? { tempGeofence: { ...state.tempGeofence, ...partial } }
            : {}
        )
    }),
    { name: "workLocationStore" }
  )
);
