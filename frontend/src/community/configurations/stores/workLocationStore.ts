import { create } from "zustand";

import {
  WorkLocationSliceType,
  workLocationSlice
} from "./slices/workLocationSlice";

export type { GeofenceTempState } from "./slices/workLocationSlice";

export const useWorkLocationStore = create<WorkLocationSliceType>((set) => ({
  ...workLocationSlice(set)
}));
