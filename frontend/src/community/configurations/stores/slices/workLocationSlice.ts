import { SetType } from "~community/common/types/storeTypes";

export interface GeofenceTempState {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}

export interface WorkLocationSliceType {
  isDeleteModalOpen: boolean;
  selectedLocationId: number | null;
  isGeofenceModalOpen: boolean;
  tempGeofence: GeofenceTempState | null;
  isFormDirty: boolean;
  isUnsavedModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  setSelectedLocationId: (id: number | null) => void;
  setIsGeofenceModalOpen: (open: boolean) => void;
  setTempGeofence: (geofence: GeofenceTempState | null) => void;
  updateTempGeofence: (partial: Partial<GeofenceTempState>) => void;
  setIsFormDirty: (dirty: boolean) => void;
  setIsUnsavedModalOpen: (open: boolean) => void;
}

export const workLocationSlice = (
  set: SetType<WorkLocationSliceType>
): WorkLocationSliceType => ({
  isDeleteModalOpen: false,
  selectedLocationId: null,
  isGeofenceModalOpen: false,
  tempGeofence: null,
  isFormDirty: false,
  isUnsavedModalOpen: false,
  setIsDeleteModalOpen: (open) =>
    set((state) => ({ ...state, isDeleteModalOpen: open })),
  setSelectedLocationId: (id) =>
    set((state) => ({ ...state, selectedLocationId: id })),
  setIsGeofenceModalOpen: (open) =>
    set((state) => ({ ...state, isGeofenceModalOpen: open })),
  setTempGeofence: (geofence) =>
    set((state) => ({ ...state, tempGeofence: geofence })),
  updateTempGeofence: (partial) =>
    set((state) =>
      state.tempGeofence
        ? { tempGeofence: { ...state.tempGeofence, ...partial } }
        : {}
    ),
  setIsFormDirty: (dirty) =>
    set((state) => ({ ...state, isFormDirty: dirty })),
  setIsUnsavedModalOpen: (open) =>
    set((state) => ({ ...state, isUnsavedModalOpen: open }))
});
