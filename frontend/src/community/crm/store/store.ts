import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmContactModalSlice from "./slices/crmContactModalSlice";
import CrmTaskModalSlice from "./slices/crmTaskModalSlice";
import CrmCompanySidePanelSlice from "./slices/crmCompanySidePanelSlice";
import CrmContactSidePanelSlice from "./slices/crmContactSidePanelSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmContactModalSlice(set),
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
