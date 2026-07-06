import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmBoardSlice from "./slices/crmBoardSlice";
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
      ...CrmContactSlice(set, get),
      ...CrmDealSlice(set, get),
      ...CrmTaskSlice(set, get),
      ...CrmSidePanelSlice(set),
      ...CrmBoardSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
