import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmContactsModalSlice from "./slices/crmContactsModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmContactsModalSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
