import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanySlice from "./slices/crmCompanySlice";
import CrmContactSlice from "./slices/crmContactSlice";
import CrmDealSlice from "./slices/crmDealSlice";
import CrmSidePanelSlice from "./slices/crmSidePanelSlice";
import CrmTaskSlice from "./slices/crmTaskSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set, get) => ({
      ...CrmCompanySlice(set),
      ...CrmContactSlice(set),
      ...CrmDealSlice(set),
      ...CrmTaskSlice(set, get),
      ...CrmSidePanelSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
