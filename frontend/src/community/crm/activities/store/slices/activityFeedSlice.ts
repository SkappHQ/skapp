import { StateCreator } from "zustand";

import { DEFAULT_ACTIVITY_TAB } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFeedSliceState,
  ActivityFeedSliceTypes,
  ActivityStore
} from "~community/crm/activities/store/activityStoreTypes";

const initialActivityFeedState: ActivityFeedSliceState = {
  activeTab: DEFAULT_ACTIVITY_TAB,
  search: "",
  appliedFilters: {}
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
  applyFilters: (filters) => set({ appliedFilters: { ...filters } }),
  resetActivityFeed: () => set(initialActivityFeedState)
});

export default ActivityFeedSlice;
