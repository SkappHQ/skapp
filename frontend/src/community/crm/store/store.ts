import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmCompanySidePanelSlice from "./slices/crmCompanySidePanelSlice";
import CrmContactSidePanelSlice from "./slices/crmContactSidePanelSlice";
import CrmTaskModalSlice from "./slices/crmTaskModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmTaskModalSlice(set),
      ...CrmCompanySidePanelSlice(set),
      ...CrmContactSidePanelSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
