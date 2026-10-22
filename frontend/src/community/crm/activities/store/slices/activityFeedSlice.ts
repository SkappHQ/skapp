import { StateCreator } from "zustand";

import {
  DEFAULT_ACTIVITY_TAB,
  EMPTY_ACTIVITY_FILTERS
} from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedSliceState,
  ActivityFeedSliceTypes,
  ActivityStore
} from "~community/crm/activities/store/activityStoreTypes";

export const initialActivityFeedState: ActivityFeedSliceState = {
  activeTab: DEFAULT_ACTIVITY_TAB,
  search: "",
  appliedFilters: EMPTY_ACTIVITY_FILTERS
};

const ActivityFeedSlice: StateCreator<
  ActivityStore,
  [["zustand/devtools", never]],
  [],
  ActivityFeedSliceTypes
> = (set) => ({
  ...initialActivityFeedState,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSearch: (search) => set({ search }),
  applyFilters: (filters) =>
    set({
      appliedFilters: {
        ownerId: filters.ownerId,
        dateRange: {
          from: filters.dateRange.from,
          to: filters.dateRange.to
        }
      }
    }),
  resetActivityFeed: () => set(initialActivityFeedState)
});

export default ActivityFeedSlice;
