import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "~community/crm/v2/types/StoreTypes";

import CrmDataSlice from "./slices/crmDataSlice";
import CrmUiSlice from "./slices/crmUiSlice";

export const useCrmStoreV2 = create<CrmStore>()(
  devtools(
    (...args) => ({
      ...CrmDataSlice(...args),
      ...CrmUiSlice(...args)
    }),
    {
      name: "crmStoreV2",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
