import { EMPTY_ACTIVITY_FILTERS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityFilterValues,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import { useActivityStore } from "./activityStore";
import { initialActivityFeedState } from "./slices/activityFeedSlice";

const OCTOBER_FILTERS: ActivityFilterValues = {
  ownerId: 7,
  dateRange: { from: "2026-10-01", to: "2026-10-31" }
};

describe("useActivityStore", () => {
  beforeEach(() => {
    useActivityStore.getState().resetActivityFeed();
  });

  it("starts on the All tab with no filters and no selected row", () => {
    const state = useActivityStore.getState();

    expect(state.activeTab).toBe(ActivityTab.ALL);
    expect(state.search).toBe("");
    expect(state.appliedFilters).toEqual(EMPTY_ACTIVITY_FILTERS);
    expect(state.selectedActivity).toBeNull();
  });

  it("updates the search directly", () => {
    useActivityStore.getState().setSearch("acme");

    expect(useActivityStore.getState().search).toBe("acme");
  });

  it("stores the filters only when they are applied", () => {
    useActivityStore.getState().applyFilters(OCTOBER_FILTERS);

    expect(useActivityStore.getState().appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("copies the applied filters so later draft edits do not leak in", () => {
    const draft: ActivityFilterValues = {
      ownerId: 7,
      dateRange: { from: "2026-10-01", to: "2026-10-31" }
    };
    useActivityStore.getState().applyFilters(draft);
    draft.ownerId = 99;
    draft.dateRange.from = "2026-01-01";

    expect(useActivityStore.getState().appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("keeps the search, team member and date range when the tab changes", () => {
    const store = useActivityStore.getState();

    store.setSearch("acme");
    store.applyFilters(OCTOBER_FILTERS);
    store.setActiveTab(ActivityTab.CALLS);
    store.setActiveTab(ActivityTab.MEETINGS);

    const state = useActivityStore.getState();
    expect(state.activeTab).toBe(ActivityTab.MEETINGS);
    expect(state.search).toBe("acme");
    expect(state.appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("clears only the search when the search is cleared", () => {
    const store = useActivityStore.getState();

    store.setActiveTab(ActivityTab.TASKS);
    store.applyFilters(OCTOBER_FILTERS);
    store.setSearch("acme");
    store.setSearch("");

    const state = useActivityStore.getState();
    expect(state.search).toBe("");
    expect(state.activeTab).toBe(ActivityTab.TASKS);
    expect(state.appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("stores and clears the selected row", () => {
    const store = useActivityStore.getState();

    store.setSelectedActivity({ id: 12, type: ActivityType.TASK });
    expect(useActivityStore.getState().selectedActivity).toEqual({
      id: 12,
      type: ActivityType.TASK
    });

    store.setSelectedActivity(null);
    expect(useActivityStore.getState().selectedActivity).toBeNull();
  });

  it("resets everything back to the initial state", () => {
    const store = useActivityStore.getState();

    store.setActiveTab(ActivityTab.TASKS);
    store.setSearch("acme");
    store.applyFilters(OCTOBER_FILTERS);
    store.setSelectedActivity({ id: 3, type: ActivityType.CALL });
    store.resetActivityFeed();

    expect(useActivityStore.getState()).toMatchObject(initialActivityFeedState);
  });

  it("starts fresh after a full page reload", () => {
    useActivityStore.getState().setActiveTab(ActivityTab.CALLS);
    useActivityStore.getState().setSearch("acme");
    useActivityStore.getState().applyFilters(OCTOBER_FILTERS);

    jest.isolateModules(() => {
      const { useActivityStore: reloadedStore } =
        jest.requireActual<typeof import("./activityStore")>("./activityStore");
      const state = reloadedStore.getState();

      expect(state.activeTab).toBe(ActivityTab.ALL);
      expect(state.search).toBe("");
      expect(state.appliedFilters).toEqual(EMPTY_ACTIVITY_FILTERS);
    });

    expect(useActivityStore.getState().activeTab).toBe(ActivityTab.CALLS);
  });
});
