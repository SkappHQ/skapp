import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "~community/crm/types/StoreTypes";

import CrmDataSlice from "./slices/crmDataSlice";
import CrmUiSlice from "./slices/crmUiSlice";

export const useCrmStore = create<CrmStore>()(
  devtools(
    (...args) => ({
      ...CrmDataSlice(...args),
      ...CrmUiSlice(...args)
    }),
    {
      name: "crmStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
