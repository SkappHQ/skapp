import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanySlice from "./slices/crmCompanySlice";
import CrmContactSlice from "./slices/crmContactSlice";
import CrmTaskSlice from "./slices/crmTaskSlice";
import CrmSidePanelSlice from "./slices/crmSidePanelSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanySlice(set),
      ...CrmContactSlice(set),
      ...CrmTaskSlice(set),
      ...CrmSidePanelSlice(set),
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
