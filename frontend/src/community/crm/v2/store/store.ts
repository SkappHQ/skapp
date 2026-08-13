import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CrmStore } from "~community/crm/v2/types/StoreTypes";
import CrmDataSlice from "./slices/crmDataSlice";
import CrmUiSlice from "./slices/crmUiSlice";

export const useCrmStoreV2 = create<
  CrmStore,
  [["zustand/devtools", never]]
>(
  devtools(
    (set) => ({
      ...CrmDataSlice(set),
      ...CrmUiSlice(set)
    }),
    {
      name: "crmStoreV2",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
