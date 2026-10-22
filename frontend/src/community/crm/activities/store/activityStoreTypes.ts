import {
  ActivityFilterValues,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";

export interface ActivityFeedSliceState {
  activeTab: ActivityTab;
  search: string;
  appliedFilters: ActivityFilterValues;
}

export interface ActivityFeedSliceActions {
  setActiveTab: (activeTab: ActivityTab) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: ActivityFilterValues) => void;
  resetActivityFeed: () => void;
}

export type ActivityFeedSliceTypes = ActivityFeedSliceState &
  ActivityFeedSliceActions;

export type ActivityStore = ActivityFeedSliceTypes;
