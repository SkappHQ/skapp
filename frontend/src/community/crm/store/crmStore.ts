import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/CrmStoreTypes";
import crmCompanyModalSlice from "./slices/crmCompanyModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...crmCompanyModalSlice(set)
    }),
    { name: "crmStore" }
  )
);
