import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { CommonStoreTypes } from "../types/zustand/StoreTypes";
import { authTokenSlice } from "./slices/authTokenSlice";
import { breadcrumbSlice } from "./slices/breadcrumbSlice";
import { commonModalSlice } from "./slices/commonModalSlice";
import { notificationsSlice } from "./slices/notificationsSlice";
import { orgDetailsSlice } from "./slices/orgDetailsSlice";
import { settingsModalSlice } from "./slices/settingsModalSlice";
import { templateSlice } from "./slices/templateSlice";

const REDACTED_VALUE = "<redacted>";

const redactAccessToken = (state: CommonStoreTypes): CommonStoreTypes =>
  state?.accessToken ? { ...state, accessToken: REDACTED_VALUE } : state;

export const useCommonStore = create<
  CommonStoreTypes,
  [["zustand/devtools", never], ["zustand/persist", CommonStoreTypes]]
>(
  devtools(
    (set) => ({
      ...templateSlice(set),
      ...settingsModalSlice(set),
      ...commonModalSlice(set),
      ...notificationsSlice(set),
      ...orgDetailsSlice(set),
      ...breadcrumbSlice(set),
      ...authTokenSlice(set)
    }),
    { name: "commonStore", stateSanitizer: redactAccessToken }
  )
);
