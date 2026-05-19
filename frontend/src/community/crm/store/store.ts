import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "../types/StoreTypes";
import CrmContactDetailSlice from "./slices/CrmContactDetailSlice";
import CrmCompanyModalSlice from "./slices/crmCompanyModalSlice";
import CrmContactsModalSlice from "./slices/crmContactsModalSlice";
import CrmSidePanelSlice from "./slices/crmSidePanelSlice";

export const useCrmStore = create<
  CrmStore,
  [["zustand/devtools", never], ["zustand/persist", CrmStore]]
>(
  devtools(
    (set) => ({
      ...CrmCompanyModalSlice(set),
      ...CrmContactsModalSlice(set),
      ...CrmSidePanelSlice(set),
      ...CrmContactDetailSlice(set)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
