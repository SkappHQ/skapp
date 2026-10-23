import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { ActivityStore } from "~community/crm/activities/store/activityStoreTypes";

import ActivityFeedSlice from "./slices/activityFeedSlice";

export const useActivityStore = create<ActivityStore>()(
  devtools(
    (...args) => ({
      ...ActivityFeedSlice(...args)
    }),
    {
      name: "crmActivityStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
