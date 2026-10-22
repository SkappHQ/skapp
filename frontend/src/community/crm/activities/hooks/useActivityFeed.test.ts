import { act, renderHook } from "@testing-library/react";

import { ToastType } from "~community/common/enums/ComponentEnums";
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
import { SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";

import { useActivityFeed } from "./useActivityFeed";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

const mockSetToastMessage = jest.fn();

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: mockSetToastMessage })
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

const OCTOBER_FILTERS = { ownerId: 2, from: "2026-10-01", to: "2026-10-31" };
const NO_FILTERS = { ownerId: null, from: null, to: null };

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

describe("useActivityFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useActivityStore.getState().resetActivityFeed();
    mockUseFeed.mockReturnValue(feedResult());
    mockUseTeamMembers.mockReturnValue({
      data: activityTeamMembersMock,
      isLoading: false,
      isError: false
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("queries the All tab with no filters by default", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: true }));

    expect(lastQuery()).toEqual({
      tab: ActivityTab.ALL,
      search: "",
      ...NO_FILTERS
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("sends the search only after the debounce delay", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    act(() => result.current.setSearch("  acme "));
    expect(result.current.search).toBe("  acme ");
    expect(lastQuery().search).toBe("");

    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY);
    });

    expect(lastQuery().search).toBe("acme");
    expect(result.current.appliedSearch).toBe("acme");
    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.hasAppliedFilters).toBe(false);
  });

  it("changes the query only when manager filters are applied", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: true }));
    const callsBefore = mockUseFeed.mock.calls.length;

    expect(lastQuery()).toMatchObject(NO_FILTERS);

    act(() => result.current.applyFilters(OCTOBER_FILTERS));

    expect(mockUseFeed.mock.calls.length).toBeGreaterThan(callsBefore);
    expect(lastQuery()).toEqual({
      tab: ActivityTab.ALL,
      search: "",
      ...OCTOBER_FILTERS
    });
    expect(result.current.appliedFilters).toEqual(OCTOBER_FILTERS);
    expect(result.current.hasAppliedFilters).toBe(true);
  });

  it("clears the manager filters on reset", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: true }));

    act(() => result.current.applyFilters(OCTOBER_FILTERS));
    act(() => result.current.resetFilters());

    expect(lastQuery()).toMatchObject(NO_FILTERS);
    expect(result.current.hasAppliedFilters).toBe(false);
  });

  it("never sends the owner or date range for reps", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    act(() => result.current.applyFilters(OCTOBER_FILTERS));

    expect(lastQuery()).toMatchObject(NO_FILTERS);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("keeps the search and filters when the tab changes", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: true }));

    act(() => {
      result.current.setSearch("acme");
      result.current.applyFilters(OCTOBER_FILTERS);
    });
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_DELAY);
    });
    act(() => result.current.setActiveTab(ActivityTab.CALLS));

    expect(lastQuery()).toEqual({
      tab: ActivityTab.CALLS,
      search: "acme",
      ...OCTOBER_FILTERS
    });
    expect(result.current.activeTab).toBe(ActivityTab.CALLS);
  });

  it("keeps the tab and filters when the page is opened again in the session", () => {
    const first = renderHook(() => useActivityFeed({ isManager: true }));

    act(() => {
      first.result.current.setActiveTab(ActivityTab.EMAILS);
      first.result.current.applyFilters(OCTOBER_FILTERS);
    });
    first.unmount();

    const second = renderHook(() => useActivityFeed({ isManager: true }));

    expect(second.result.current.activeTab).toBe(ActivityTab.EMAILS);
    expect(second.result.current.appliedFilters).toEqual(OCTOBER_FILTERS);
  });

  it("only loads team members for managers", () => {
    renderHook(() => useActivityFeed({ isManager: false }));
    expect(mockUseTeamMembers).toHaveBeenLastCalledWith(false);

    const { result } = renderHook(() => useActivityFeed({ isManager: true }));
    expect(mockUseTeamMembers).toHaveBeenLastCalledWith(true);
    expect(result.current.teamMembers).toEqual(activityTeamMembersMock);
  });

  it("keeps the feed working when team members fail", () => {
    mockUseTeamMembers.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true
    });

    const { result } = renderHook(() => useActivityFeed({ isManager: true }));

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

    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    expect(result.current.pages).toEqual([firstPage, lastPage]);
    expect(result.current.isEmpty).toBe(false);
  });

  it("reports an empty feed once loaded with no rows", () => {
    mockUseFeed.mockReturnValue(
      feedResult({ data: { pages: [emptyPage], pageParams: [0] } })
    );

    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    expect(result.current.isEmpty).toBe(true);
  });

  it("does not report empty while loading", () => {
    mockUseFeed.mockReturnValue(feedResult({ data: null, isLoading: true }));

    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.pages).toEqual([]);
    expect(result.current.isEmpty).toBe(false);
  });

  it("loads the next By month page only when there is one", () => {
    const { result, rerender } = renderHook(() =>
      useActivityFeed({ isManager: false })
    );

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

    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    expect(result.current.isError).toBe(true);
    expect(result.current.isEmpty).toBe(false);
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

    const { rerender } = renderHook(() =>
      useActivityFeed({ isManager: false })
    );
    rerender();
    expect(mockSetToastMessage).toHaveBeenCalledTimes(1);

    mockUseFeed.mockReturnValue(
      feedResult({ data: null, isError: true, errorUpdatedAt: 2 })
    );
    rerender();
    expect(mockSetToastMessage).toHaveBeenCalledTimes(2);
  });

  it("does not show the toast when the feed loads", () => {
    renderHook(() => useActivityFeed({ isManager: false }));

    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("stores the clicked row as the selected activity", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: false }));
    const row = firstRow();

    act(() => result.current.onRowClick(row));

    expect(result.current.selectedActivity).toEqual({
      id: row.id,
      type: row.type
    });
  });

  it("leaves the store alone when a task is toggled", () => {
    const { result } = renderHook(() => useActivityFeed({ isManager: false }));

    act(() =>
      result.current.onToggleComplete({
        ...firstRow(),
        type: ActivityType.TASK
      })
    );

    expect(useActivityStore.getState().selectedActivity).toBeNull();
  });
});
