import { act, renderHook } from "@testing-library/react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useCommonStore } from "~community/common/stores/commonStore";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import activityFeedNextPageMock from "~community/crm/activities/__mocks__/activityFeedNextPageMock.json";
import activityTeamMembersMock from "~community/crm/activities/__mocks__/activityTeamMembersMock.json";
import {
  useGetActivityFeedInfinite,
  useGetActivityTeamMembers
} from "~community/crm/activities/api/ActivityApi";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import { useActivityFeed } from "./useActivityFeed";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

const mockSetToastMessage = jest.fn();

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: mockSetToastMessage })
}));

const mockUseSessionData = jest.fn();

jest.mock("~community/common/hooks/useSessionData", () => ({
  __esModule: true,
  default: () => mockUseSessionData()
}));

const mockToggleTaskComplete = jest.fn();

jest.mock("~community/crm/activities/hooks/useActivityTaskCompletion", () => ({
  useActivityTaskCompletion: () => ({
    toggleTaskComplete: mockToggleTaskComplete
  })
}));

jest.mock("~community/crm/activities/api/ActivityApi", () => ({
  useGetActivityFeedInfinite: jest.fn(),
  useGetActivityTeamMembers: jest.fn()
}));

const mockUseFeed = useGetActivityFeedInfinite as unknown as jest.Mock;
const mockUseTeamMembers = useGetActivityTeamMembers as unknown as jest.Mock;
const mockFetchNextPage = jest.fn();

const firstPage = activityFeedMock as ActivityFeedResponse;
const lastPage = activityFeedNextPageMock as ActivityFeedResponse;
const emptyPage: ActivityFeedResponse = {
  overdue: [],
  today: [],
  upcoming: [],
  byMonth: { items: [], page: 0, hasMore: false }
};

const OCTOBER_FILTERS = {
  ownerId: 2,
  dateRange: { from: "2026-10-01", to: "2026-10-31" }
};
const OCTOBER_QUERY = { ownerId: 2, from: "2026-10-01", to: "2026-10-31" };
const NO_FILTERS = { ownerId: null, from: null, to: null };

const REP_SESSION = {
  isCrmSalesRepresentative: true,
  isCrmSalesManager: false,
  isCrmAdmin: false,
  isSuperAdmin: false
};

const ROLE_SESSIONS = {
  rep: REP_SESSION,
  manager: { ...REP_SESSION, isCrmSalesManager: true },
  crmAdmin: { ...REP_SESSION, isCrmAdmin: true },
  superAdmin: { ...REP_SESSION, isSuperAdmin: true }
};

type Role = keyof typeof ROLE_SESSIONS;

const renderFeedAs = (role: Role) => {
  mockUseSessionData.mockReturnValue(ROLE_SESSIONS[role]);
  return renderHook(() => useActivityFeed());
};

const feedResult = (overrides: Record<string, unknown> = {}) => ({
  data: { pages: [firstPage], pageParams: [0] },
  isLoading: false,
  isError: false,
  errorUpdatedAt: 0,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: mockFetchNextPage,
  ...overrides
});

const lastQuery = () =>
  mockUseFeed.mock.calls[mockUseFeed.mock.calls.length - 1][0];

const firstRow = (): ActivityRow => firstPage.today[0];

const initialCommonState = useCommonStore.getState();

describe("useActivityFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCommonStore.setState(initialCommonState, true);
    useActivityStore.getState().resetActivityFeed();
    mockUseFeed.mockReturnValue(feedResult());
    mockUseTeamMembers.mockReturnValue({
      data: activityTeamMembersMock,
      isLoading: false,
      isError: false
    });
  });

  describe("role access", () => {
    it("gives a sales rep no filters and no team members call", () => {
      const { result } = renderFeedAs("rep");

      act(() => result.current.applyFilters(OCTOBER_FILTERS));

      expect(result.current.isManager).toBe(false);
      expect(mockUseTeamMembers).toHaveBeenCalled();
      expect(
        mockUseTeamMembers.mock.calls.every(([enabled]) => enabled === false)
      ).toBe(true);
      expect(lastQuery()).toMatchObject(NO_FILTERS);
    });

    it.each<Role>(["manager", "crmAdmin", "superAdmin"])(
      "gives a %s the filters and the team members list",
      (role) => {
        const { result } = renderFeedAs(role);

        act(() => result.current.applyFilters(OCTOBER_FILTERS));

        expect(result.current.isManager).toBe(true);
        expect(mockUseTeamMembers).toHaveBeenLastCalledWith(true);
        expect(result.current.teamMembers).toEqual(activityTeamMembersMock);
        expect(lastQuery()).toEqual({
          tab: ActivityTab.ALL,
          search: "",
          ...OCTOBER_QUERY
        });
      }
    );

    it("treats a missing session as a sales rep", () => {
      mockUseSessionData.mockReturnValue({});
      const { result } = renderHook(() => useActivityFeed());

      expect(result.current.isManager).toBe(false);
      expect(mockUseTeamMembers).toHaveBeenLastCalledWith(false);
    });
  });

  it("queries the All tab with no filters by default", () => {
    renderFeedAs("manager");

    expect(lastQuery()).toEqual({
      tab: ActivityTab.ALL,
      search: "",
      ...NO_FILTERS
    });
  });

  it("sends the search from the toolbar straight away, trimmed", () => {
    const { result } = renderFeedAs("rep");

    act(() => result.current.setSearch("  acme "));

    expect(result.current.search).toBe("  acme ");
    expect(lastQuery().search).toBe("acme");
  });

  it("clearing the search keeps the tab and filters", () => {
    const { result } = renderFeedAs("manager");

    act(() => {
      result.current.setActiveTab(ActivityTab.TASKS);
      result.current.applyFilters(OCTOBER_FILTERS);
      result.current.setSearch("acme");
    });
    act(() => result.current.setSearch(""));

    expect(lastQuery()).toEqual({
      tab: ActivityTab.TASKS,
      search: "",
      ...OCTOBER_QUERY
    });
  });

  it("uses the synced request timezone and falls back to the browser", () => {
    const { result } = renderFeedAs("rep");
    expect(result.current.timeZone).toBe(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    act(() => useCommonStore.getState().setRequestTimezone("Asia/Colombo"));

    expect(result.current.timeZone).toBe("Asia/Colombo");
  });

  it("counts the loaded rows for the search announcement", () => {
    const { result } = renderFeedAs("rep");

    expect(result.current.resultCount).toBe(
      firstPage.overdue.length +
        firstPage.today.length +
        firstPage.upcoming.length +
        firstPage.byMonth.items.length
    );
  });

  it("has no result count while loading", () => {
    mockUseFeed.mockReturnValue(feedResult({ data: null, isLoading: true }));

    const { result } = renderFeedAs("rep");

    expect(result.current.resultCount).toBeNull();
  });

  it("keeps the filter for a manager with an empty team", () => {
    mockUseTeamMembers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false
    });

    const { result } = renderFeedAs("manager");

    expect(result.current.isManager).toBe(true);
    expect(result.current.teamMembers).toEqual([]);
    expect(result.current.pages).toEqual([firstPage]);
  });

  it("changes the query only when filters are applied", () => {
    const { result } = renderFeedAs("manager");
    const callsBefore = mockUseFeed.mock.calls.length;

    expect(lastQuery()).toMatchObject(NO_FILTERS);

    act(() => result.current.applyFilters(OCTOBER_FILTERS));

    expect(mockUseFeed.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(lastQuery()).toMatchObject(OCTOBER_QUERY);
    expect(result.current.appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("keeps the search and filters when the tab changes", () => {
    const { result } = renderFeedAs("manager");

    act(() => {
      result.current.setSearch("acme");
      result.current.applyFilters(OCTOBER_FILTERS);
    });
    act(() => result.current.setActiveTab(ActivityTab.CALLS));

    expect(lastQuery()).toEqual({
      tab: ActivityTab.CALLS,
      search: "acme",
      ...OCTOBER_QUERY
    });
    expect(result.current.activeTab).toBe(ActivityTab.CALLS);
  });

  it("keeps the tab and filters when the page is opened again in the session", () => {
    const first = renderFeedAs("superAdmin");

    act(() => {
      first.result.current.setActiveTab(ActivityTab.EMAILS);
      first.result.current.applyFilters(OCTOBER_FILTERS);
    });
    first.unmount();

    const second = renderFeedAs("superAdmin");

    expect(second.result.current.activeTab).toBe(ActivityTab.EMAILS);
    expect(second.result.current.appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("keeps the feed working when team members fail", () => {
    mockUseTeamMembers.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true
    });

    const { result } = renderFeedAs("manager");

    expect(result.current.teamMembers).toEqual([]);
    expect(result.current.isTeamMembersError).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.pages).toEqual([firstPage]);
    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("exposes every loaded page", () => {
    mockUseFeed.mockReturnValue(
      feedResult({ data: { pages: [firstPage, lastPage], pageParams: [0, 1] } })
    );

    const { result } = renderFeedAs("rep");

    expect(result.current.pages).toEqual([firstPage, lastPage]);
  });

  it("hides the controls on an empty tab and brings them back for a search", () => {
    mockUseFeed.mockReturnValue(
      feedResult({ data: { pages: [emptyPage], pageParams: [0] } })
    );
    const { result } = renderFeedAs("rep");

    expect(result.current.showControls).toBe(false);

    act(() => result.current.setSearch("acme"));
    expect(result.current.showControls).toBe(true);

    act(() => result.current.setSearch(""));
    expect(result.current.showControls).toBe(false);
  });

  it("keeps the controls while a search is loading", () => {
    mockUseFeed.mockReturnValue(feedResult({ data: null, isLoading: true }));
    const { result } = renderFeedAs("rep");

    expect(result.current.showControls).toBe(false);

    act(() => result.current.setSearch("acme"));
    expect(result.current.showControls).toBe(true);
  });

  it("exposes loading state and no pages while loading", () => {
    mockUseFeed.mockReturnValue(feedResult({ data: null, isLoading: true }));

    const { result } = renderFeedAs("rep");

    expect(result.current.isLoading).toBe(true);
    expect(result.current.pages).toEqual([]);
  });

  it("loads the next By month page only when there is one", () => {
    const { result, rerender } = renderFeedAs("rep");

    act(() => result.current.loadMore());
    expect(mockFetchNextPage).not.toHaveBeenCalled();

    mockUseFeed.mockReturnValue(feedResult({ hasNextPage: true }));
    rerender();
    act(() => result.current.loadMore());
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);

    mockUseFeed.mockReturnValue(
      feedResult({ hasNextPage: true, isFetchingNextPage: true })
    );
    rerender();
    act(() => result.current.loadMore());
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("shows the warning toast when the feed fails to load", () => {
    mockUseFeed.mockReturnValue(
      feedResult({ data: null, isError: true, errorUpdatedAt: 1 })
    );

    const { result } = renderFeedAs("rep");

    expect(result.current.isError).toBe(true);
    expect(mockSetToastMessage).toHaveBeenCalledTimes(1);
    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.WARN,
      title: "activities.toasts.loadError.title",
      description: "activities.toasts.loadError.description",
      isIcon: true
    });
  });

  it("shows the toast again for a new failure but not on rerender", () => {
    mockUseFeed.mockReturnValue(
      feedResult({ data: null, isError: true, errorUpdatedAt: 1 })
    );

    const { rerender } = renderFeedAs("rep");
    rerender();
    expect(mockSetToastMessage).toHaveBeenCalledTimes(1);

    mockUseFeed.mockReturnValue(
      feedResult({ data: null, isError: true, errorUpdatedAt: 2 })
    );
    rerender();
    expect(mockSetToastMessage).toHaveBeenCalledTimes(2);
  });

  it("does not show the toast when the feed loads", () => {
    renderFeedAs("rep");

    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("hands task toggles to the completion hook", () => {
    const { result } = renderFeedAs("rep");
    const row = { ...firstRow(), type: ActivityType.TASK };

    act(() => result.current.onToggleComplete(row, true));

    expect(mockToggleTaskComplete).toHaveBeenCalledWith(row, true);
  });
});
