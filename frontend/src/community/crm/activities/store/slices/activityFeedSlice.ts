import { StateCreator } from "zustand";

import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityAppliedFilters,
  ActivityFeedSliceState,
  ActivityFeedSliceTypes,
  ActivityStore
} from "~community/crm/activities/store/activityStoreTypes";

export const EMPTY_ACTIVITY_FILTERS: ActivityAppliedFilters = {
  ownerId: null,
  from: null,
  to: null
};

export const initialActivityFeedState: ActivityFeedSliceState = {
  activeTab: DEFAULT_ACTIVITY_TAB,
  search: "",
  appliedFilters: EMPTY_ACTIVITY_FILTERS,
  selectedActivity: null
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
        from: filters.from,
        to: filters.to
      }
    }),
  resetFilters: () => set({ appliedFilters: EMPTY_ACTIVITY_FILTERS }),
  setSelectedActivity: (selectedActivity) => set({ selectedActivity }),
  resetActivityFeed: () => set(initialActivityFeedState)
});

export default ActivityFeedSlice;
