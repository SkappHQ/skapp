import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  SidePanelSlice,
  createSidePanelSlice
} from "./slices/sidePanelSlice";

export type StoreState = SidePanelSlice;

export const useAppStore = create<
  StoreState,
  [["zustand/devtools", never]]
>(
  devtools(
    (set) => ({
      ...createSidePanelSlice(set)
    }),
    {
      name: "appStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
