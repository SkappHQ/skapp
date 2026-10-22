import { useCommonStore } from "~community/common/stores/commonStore";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import activityFeedNextPageMock from "~community/crm/activities/__mocks__/activityFeedNextPageMock.json";
import {
  ActivityFeedResponse,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import {
  ActivityFeedQuery,
  buildActivityFeedParams,
  countActivityFeedRows,
  getActivityTypeForTab,
  getNextActivityFeedPage,
  getViewerTimezone,
  resolveViewerTimezone,
  shouldShowActivityControls
} from "./activityFeedParams";

const firstPage = activityFeedMock as ActivityFeedResponse;
const lastPage = activityFeedNextPageMock as ActivityFeedResponse;

const baseQuery: ActivityFeedQuery = {
  tab: ActivityTab.ALL,
  search: "",
  ownerId: null,
  from: null,
  to: null
};

describe("getActivityTypeForTab", () => {
  it.each([
    [ActivityTab.ALL, null],
    [ActivityTab.TASKS, ActivityType.TASK],
    [ActivityTab.CALLS, ActivityType.CALL],
    [ActivityTab.MEETINGS, ActivityType.MEETING],
    [ActivityTab.EMAILS, ActivityType.EMAIL]
  ])("maps the %s tab to %s", (tab, type) => {
    expect(getActivityTypeForTab(tab)).toBe(type);
  });
});

describe("buildActivityFeedParams", () => {
  it("sends only the page for the All tab with no filters", () => {
    expect(buildActivityFeedParams(baseQuery, 0)).toEqual({ page: 0 });
  });

  it("sends the type for a type tab", () => {
    expect(
      buildActivityFeedParams({ ...baseQuery, tab: ActivityTab.CALLS }, 2)
    ).toEqual({ page: 2, type: ActivityType.CALL });
  });

  it("sends every filter that has a value and trims the search", () => {
    expect(
      buildActivityFeedParams(
        {
          tab: ActivityTab.MEETINGS,
          search: "  acme ",
          ownerId: 0,
          from: "2026-10-01",
          to: "2026-10-31"
        },
        1
      )
    ).toEqual({
      page: 1,
      type: ActivityType.MEETING,
      search: "acme",
      ownerId: 0,
      from: "2026-10-01",
      to: "2026-10-31"
    });
  });

  it("leaves out a blank search", () => {
    expect(buildActivityFeedParams({ ...baseQuery, search: "   " }, 0)).toEqual(
      { page: 0 }
    );
  });

  it("sends a half-open date range as is", () => {
    expect(
      buildActivityFeedParams({ ...baseQuery, from: "2026-10-01" }, 0)
    ).toEqual({ page: 0, from: "2026-10-01" });
  });
});

describe("getNextActivityFeedPage", () => {
  it("returns the next By month page while there is more", () => {
    expect(getNextActivityFeedPage(firstPage)).toBe(firstPage.byMonth.page + 1);
  });

  it("returns null when there are no more pages", () => {
    expect(getNextActivityFeedPage(lastPage)).toBeNull();
    expect(getNextActivityFeedPage(null)).toBeNull();
  });
});

describe("countActivityFeedRows", () => {
  it("counts the dated buckets once and every By month page", () => {
    const datedRows =
      firstPage.overdue.length +
      firstPage.today.length +
      firstPage.upcoming.length;

    expect(countActivityFeedRows([])).toBe(0);
    expect(
      countActivityFeedRows([
        firstPage,
        { ...lastPage, today: firstPage.today }
      ])
    ).toBe(
      datedRows + firstPage.byMonth.items.length + lastPage.byMonth.items.length
    );
  });
});

describe("resolveViewerTimezone", () => {
  it("prefers the given timezone and falls back to the browser", () => {
    expect(resolveViewerTimezone("Asia/Colombo")).toBe("Asia/Colombo");
    expect(resolveViewerTimezone()).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  });
});

describe("getViewerTimezone", () => {
  const initialState = useCommonStore.getState();

  afterEach(() => {
    useCommonStore.setState(initialState, true);
  });

  it("uses the synced request timezone when there is one", () => {
    useCommonStore.getState().setRequestTimezone("Asia/Colombo");

    expect(getViewerTimezone()).toBe("Asia/Colombo");
  });

  it("falls back to the browser timezone", () => {
    expect(getViewerTimezone()).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  });
});

describe("shouldShowActivityControls", () => {
  const base = {
    hasActiveFilters: false,
    isError: false,
    isLoading: false,
    isEmpty: false
  };

  it("hides the controls only for a loaded, truly empty tab", () => {
    expect(shouldShowActivityControls({ ...base, isEmpty: true })).toBe(false);
  });

  it("stays hidden during the first load with nothing active", () => {
    expect(
      shouldShowActivityControls({ ...base, isLoading: true, isEmpty: false })
    ).toBe(false);
  });

  it("shows the controls once the tab has rows", () => {
    expect(shouldShowActivityControls(base)).toBe(true);
  });

  it("never hides the controls while a search or filter is active", () => {
    expect(
      shouldShowActivityControls({
        ...base,
        hasActiveFilters: true,
        isLoading: true
      })
    ).toBe(true);
    expect(
      shouldShowActivityControls({
        ...base,
        hasActiveFilters: true,
        isEmpty: true
      })
    ).toBe(true);
  });

  it("shows the controls when the feed errors", () => {
    expect(shouldShowActivityControls({ ...base, isError: true })).toBe(true);
  });
});
