import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CommonStoreTypes } from "../types/zustand/StoreTypes";
import { breadcrumbSlice } from "./slices/breadcrumbSlice";
import { notificationsSlice } from "./slices/notificationsSlice";
import { orgDetailsSlice } from "./slices/orgDetailsSlice";
import { settingsModalSlice } from "./slices/settingsModalSlice";
import { templateSlice } from "./slices/templateSlice";

export const useCommonStore = create<
  CommonStoreTypes,
  [["zustand/devtools", never], ["zustand/persist", CommonStoreTypes]]
>(
  devtools(
    (set) => ({
      ...templateSlice(set),
      ...settingsModalSlice(set),
      ...notificationsSlice(set),
      ...orgDetailsSlice(set),
      ...breadcrumbSlice(set)
    }),
    { name: "commonStore" }
  )
);
