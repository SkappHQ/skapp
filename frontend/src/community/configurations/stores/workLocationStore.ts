import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  WorkLocationSliceType,
  workLocationSlice
} from "./slices/workLocationSlice";

export type { GeofenceTempState } from "./slices/workLocationSlice";

export const useWorkLocationStore = create<
  WorkLocationSliceType,
  [["zustand/devtools", never]]
>(
  devtools(
    (set) => ({
      ...workLocationSlice(set)
    }),
    { name: "workLocationStore" }
  )
);
