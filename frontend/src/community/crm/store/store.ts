import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanySlice";
import CrmContactModalSlice from "./slices/crmContactSlice";
import CrmTaskModalSlice from "./slices/crmTaskSlice";
import CrmSidePanelSlice from "./slices/crmSidePanelSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmContactModalSlice(set),
      ...CrmTaskModalSlice(set),
      ...CrmSidePanelSlice(set),
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
