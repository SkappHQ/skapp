import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import authFetch from "~community/common/utils/axiosInterceptor";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import {
  ActivityFeedCacheData,
  patchTaskInFeedData
} from "~community/crm/activities/api/utils/activityFeedCache";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTab,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import {
  ACTIVITY_COMPLETE_DEBOUNCE_DELAY,
  useActivityTaskCompletion
} from "./useActivityTaskCompletion";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

const mockSetToastMessage = jest.fn();

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: mockSetToastMessage })
}));

jest.mock("~community/common/utils/axiosInterceptor", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() }
}));

const mockPatch = authFetch.patch as jest.Mock;

const feedPage = activityFeedMock as ActivityFeedResponse;

const openTask = (): ActivityRow => ({
  ...feedPage.today[0],
  id: 501,
  type: ActivityType.TASK,
  isCompleted: false,
  completedAt: null,
  canComplete: true
});

const ALL_KEY = crmActivityQueryKeys.FEED({
  tab: ActivityTab.ALL,
  search: "",
  ownerId: null,
  from: null,
  to: null
});

const TASKS_KEY = crmActivityQueryKeys.FEED({
  tab: ActivityTab.TASKS,
  search: "",
  ownerId: null,
  from: null,
  to: null
});

const seedFeed = (queryClient: QueryClient, row: ActivityRow) => {
  const data: ActivityFeedCacheData = {
    pages: [{ ...feedPage, today: [row, ...feedPage.today] }],
    pageParams: [0]
  };

  queryClient.setQueryData(ALL_KEY, data);
  queryClient.setQueryData(TASKS_KEY, data);
};

const cachedTask = (queryClient: QueryClient, key: unknown[], id: number) =>
  queryClient
    .getQueryData<ActivityFeedCacheData>(key)
    ?.pages[0].today.find(
      (row) => row.id === id && row.type === ActivityType.TASK
    );

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useActivityTaskCompletion(), { wrapper });

  return { queryClient, ...hook };
};

const flushDebounce = async () => {
  await act(async () => {
    jest.advanceTimersByTime(ACTIVITY_COMPLETE_DEBOUNCE_DELAY);
  });
};

describe("useActivityTaskCompletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("flips the task in every cached feed straight away", () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);

    act(() => result.current.toggleTaskComplete(task, true));

    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(true);
    expect(cachedTask(queryClient, TASKS_KEY, task.id)?.isCompleted).toBe(true);
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it("sends the final state once after the debounce", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    mockPatch.mockResolvedValue({
      data: {
        results: [
          { ...task, isCompleted: true, completedAt: "2026-10-22T08:00:00Z" }
        ]
      }
    });

    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();

    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(mockPatch).toHaveBeenCalledWith(
      `/crm/activities/tasks/${task.id}/complete`,
      { isCompleted: true },
      { headers: { "X-Timezone": expect.any(String) } }
    );
  });

  it("reconciles the row with the server and keeps it in its bucket", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    mockPatch.mockResolvedValue({
      data: {
        results: [
          { ...task, isCompleted: true, completedAt: "2026-10-22T08:00:00Z" }
        ]
      }
    });

    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();

    const updated = cachedTask(queryClient, ALL_KEY, task.id);
    expect(updated?.isCompleted).toBe(true);
    expect(updated?.completedAt).toBe("2026-10-22T08:00:00Z");
  });

  it("marks the feed stale on success without refetching it", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const refetchSpy = jest.spyOn(queryClient, "refetchQueries");
    mockPatch.mockResolvedValue({
      data: { results: [{ ...task, isCompleted: true }] }
    });

    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: crmActivityQueryKeys.FEED_ROOT,
      refetchType: "none"
    });
    expect(refetchSpy).not.toHaveBeenCalled();
    expect(queryClient.getQueryState(ALL_KEY)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(TASKS_KEY)?.isInvalidated).toBe(true);
  });

  it("sends nothing when rapid clicks end on the original state", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);

    act(() => result.current.toggleTaskComplete(task, true));
    act(() =>
      result.current.toggleTaskComplete(
        cachedTask(queryClient, ALL_KEY, task.id) as ActivityRow,
        false
      )
    );
    await flushDebounce();

    expect(mockPatch).not.toHaveBeenCalled();
    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(false);
  });

  it("sends only the last state after three rapid clicks", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    mockPatch.mockResolvedValue({
      data: { results: [{ ...task, isCompleted: true }] }
    });

    act(() => result.current.toggleTaskComplete(task, true));
    act(() => result.current.toggleTaskComplete(task, false));
    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();

    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(mockPatch.mock.calls[0][1]).toEqual({ isCompleted: true });
  });

  it("rolls back and shows the error toast when the request fails", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    mockPatch.mockRejectedValue(new Error("Forbidden"));

    act(() => result.current.toggleTaskComplete(task, true));
    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(true);

    await flushDebounce();

    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(false);
    expect(cachedTask(queryClient, TASKS_KEY, task.id)?.isCompleted).toBe(
      false
    );
    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "activities.toasts.completeError.title",
      description: "activities.toasts.completeError.description"
    });
  });

  it("does nothing for a task the user cannot complete", async () => {
    const { queryClient, result } = setup();
    const task = { ...openTask(), canComplete: false };
    seedFeed(queryClient, task);

    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();

    expect(mockPatch).not.toHaveBeenCalled();
    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(false);
  });

  it("does nothing for a row that is not a task", async () => {
    const { queryClient, result } = setup();
    const call = { ...openTask(), type: ActivityType.CALL };
    seedFeed(queryClient, call);

    act(() => result.current.toggleTaskComplete(call, true));
    await flushDebounce();

    expect(mockPatch).not.toHaveBeenCalled();
  });

  it("re-sends when the user changes their mind while a request is in flight", async () => {
    const { queryClient, result } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    let resolveFirst: (value: unknown) => void = () => {};
    mockPatch
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({
        data: { results: [{ ...task, isCompleted: false }] }
      });

    act(() => result.current.toggleTaskComplete(task, true));
    await flushDebounce();
    expect(mockPatch).toHaveBeenCalledTimes(1);

    act(() => result.current.toggleTaskComplete(task, false));
    await flushDebounce();
    expect(mockPatch).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst({ data: { results: [{ ...task, isCompleted: true }] } });
    });

    expect(mockPatch).toHaveBeenCalledTimes(2);
    expect(mockPatch.mock.calls[1][1]).toEqual({ isCompleted: false });
    expect(cachedTask(queryClient, ALL_KEY, task.id)?.isCompleted).toBe(false);
  });

  it("submits a pending click when the page unmounts", async () => {
    const { queryClient, result, unmount } = setup();
    const task = openTask();
    seedFeed(queryClient, task);
    mockPatch.mockResolvedValue({
      data: { results: [{ ...task, isCompleted: true }] }
    });

    act(() => result.current.toggleTaskComplete(task, true));
    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockPatch).toHaveBeenCalledTimes(1);
  });
});

describe("patchTaskInFeedData", () => {
  it("patches the task in every bucket and leaves other rows alone", () => {
    const task = openTask();
    const sameIdCall = { ...task, type: ActivityType.CALL };
    const data: ActivityFeedCacheData = {
      pages: [
        {
          ...feedPage,
          overdue: [task],
          byMonth: { ...feedPage.byMonth, items: [sameIdCall, task] }
        }
      ],
      pageParams: [0]
    };

    const patched = patchTaskInFeedData(data, task.id, { isCompleted: true });

    expect(patched?.pages[0].overdue[0].isCompleted).toBe(true);
    expect(patched?.pages[0].byMonth.items[0].isCompleted).toBe(false);
    expect(patched?.pages[0].byMonth.items[1].isCompleted).toBe(true);
    expect(patched?.pages[0].today).toEqual(feedPage.today);
  });

  it("returns null data unchanged", () => {
    expect(patchTaskInFeedData(null, 1, { isCompleted: true })).toBeNull();
  });
});
