import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/CrmStoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
