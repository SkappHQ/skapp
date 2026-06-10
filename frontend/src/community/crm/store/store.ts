import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmCompanyDetailPanelSlice from "./slices/companyDetailPanelSlice";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmDealModalSlice from "./slices/crmDealModalSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmCompanyDetailPanelSlice(set),
      ...CrmDealModalSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
