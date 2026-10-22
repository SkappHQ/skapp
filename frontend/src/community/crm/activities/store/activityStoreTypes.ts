import {
  ActivityFilterValues,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

export interface SelectedActivity {
  id: number;
  type: ActivityType;
}

export interface ActivityFeedSliceState {
  activeTab: ActivityTab;
  search: string;
  appliedFilters: ActivityFilterValues;
  selectedActivity: SelectedActivity | null;
}

export interface ActivityFeedSliceActions {
  setActiveTab: (activeTab: ActivityTab) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: ActivityFilterValues) => void;
  resetFilters: () => void;
  setSelectedActivity: (selectedActivity: SelectedActivity | null) => void;
  resetActivityFeed: () => void;
}

export type ActivityFeedSliceTypes = ActivityFeedSliceState &
  ActivityFeedSliceActions;

export type ActivityStore = ActivityFeedSliceTypes;
