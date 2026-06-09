import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmTaskModalSlice from "./slices/crmTaskModalSlice";
import CrmCompanySidePanelSlice from "./slices/crmCompanySidePanelSlice";
import CrmDealModalSlice from "./slices/crmDealModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmTaskModalSlice(set),
      ...CrmCompanySidePanelSlice(set),
      ...CrmDealModalSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
