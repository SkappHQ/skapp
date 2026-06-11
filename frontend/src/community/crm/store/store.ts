import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmContactModalSlice from "./slices/crmContactModalSlice";
import CrmTaskModalSlice from "./slices/crmTaskModalSlice";
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
