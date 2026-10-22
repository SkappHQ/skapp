import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import authFetch from "~community/common/utils/axiosInterceptor";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import { ActivityFeedCacheData } from "~community/crm/activities/api/utils/activityFeedCache";
import {
  ActivityFeedResponse,
  ActivityRow,
  ActivityTab,
  ActivityTaskDetail,
  ActivityType
} from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

import {
  useCompleteActivityTask,
  useGetActivityTaskDetail,
  useUpdateActivityTask
} from "./ActivityTaskApi";

jest.mock("~community/common/utils/axiosInterceptor", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() }
}));

const mockGet = authFetch.get as jest.Mock;
const mockPatch = authFetch.patch as jest.Mock;

const feedPage = activityFeedMock as ActivityFeedResponse;

const TASK_ID = 701;

const detail: ActivityTaskDetail = {
  id: TASK_ID,
  name: "Send proposal",
  priority: CrmPriorityEnum.HIGH,
  dueAt: "2026-10-23T09:00:00Z",
  isCompleted: false,
  completedAt: null,
  notes: "Draft ready",
  owner: { id: 1, name: "Alex Perera", avatar: null },
  contact: null,
  deal: null,
  company: null,
  canComplete: true
};

const feedRow: ActivityRow = {
  ...feedPage.today[0],
  id: TASK_ID,
  type: ActivityType.TASK,
  subject: detail.name,
  isCompleted: false,
  canComplete: true
};

const FEED_KEY = crmActivityQueryKeys.FEED({
  tab: ActivityTab.ALL,
  search: "",
  ownerId: null,
  from: null,
  to: null
});

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  queryClient.setQueryData<ActivityFeedCacheData>(FEED_KEY, {
    pages: [{ ...feedPage, today: [feedRow] }],
    pageParams: [0]
  });

  return { queryClient, wrapper };
};

const cachedFeedRow = (queryClient: QueryClient) =>
  queryClient.getQueryData<ActivityFeedCacheData>(FEED_KEY)?.pages[0].today[0];

describe("useGetActivityTaskDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads and maps the task detail", async () => {
    const { wrapper } = setup();
    mockGet.mockResolvedValue({
      data: { results: [{ id: TASK_ID, name: "Send proposal" }] }
    });

    const { result } = renderHook(() => useGetActivityTaskDetail(TASK_ID), {
      wrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGet).toHaveBeenCalledWith(`/crm/activities/tasks/${TASK_ID}`, {
      headers: { "X-Timezone": expect.any(String) }
    });
    expect(result.current.data).toEqual({
      id: TASK_ID,
      name: "Send proposal",
      priority: null,
      dueAt: null,
      isCompleted: false,
      completedAt: null,
      notes: null,
      owner: null,
      contact: null,
      deal: null,
      company: null,
      canComplete: false
    });
  });

  it("does not load without a task id", () => {
    const { wrapper } = setup();

    renderHook(() => useGetActivityTaskDetail(null), { wrapper });

    expect(mockGet).not.toHaveBeenCalled();
  });
});

describe("useUpdateActivityTask", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the edit straight away and syncs the feed row on success", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(crmActivityQueryKeys.TASK_DETAIL(TASK_ID), detail);
    let resolvePatch: (value: unknown) => void = () => {};
    mockPatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePatch = resolve;
        })
    );
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useUpdateActivityTask(onSuccess), {
      wrapper
    });

    act(() => {
      result.current.mutate({ id: TASK_ID, fields: { name: "Send contract" } });
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData<ActivityTaskDetail>(
          crmActivityQueryKeys.TASK_DETAIL(TASK_ID)
        )?.name
      ).toBe("Send contract")
    );
    expect(mockPatch).toHaveBeenCalledWith(
      `/crm/activities/tasks/${TASK_ID}`,
      { name: "Send contract" },
      { headers: { "X-Timezone": expect.any(String) } }
    );

    await act(async () => {
      resolvePatch({
        data: { results: [{ ...detail, name: "Send contract" }] }
      });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(cachedFeedRow(queryClient)?.subject).toBe("Send contract");
    expect(queryClient.getQueryState(FEED_KEY)?.isInvalidated).toBe(true);
  });

  it("rolls the detail back and reports the error", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(crmActivityQueryKeys.TASK_DETAIL(TASK_ID), detail);
    mockPatch.mockRejectedValue(new Error("Forbidden"));
    const onError = jest.fn();

    const { result } = renderHook(
      () => useUpdateActivityTask(() => {}, onError),
      { wrapper }
    );

    await act(async () => {
      result.current.mutate({ id: TASK_ID, fields: { notes: "Changed" } });
    });

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(
      queryClient.getQueryData<ActivityTaskDetail>(
        crmActivityQueryKeys.TASK_DETAIL(TASK_ID)
      )?.notes
    ).toBe("Draft ready");
    expect(cachedFeedRow(queryClient)?.subject).toBe(detail.name);
  });
});

describe("useCompleteActivityTask", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates the cached detail and marks the feed stale", async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(crmActivityQueryKeys.TASK_DETAIL(TASK_ID), detail);
    mockPatch.mockResolvedValue({
      data: {
        results: [
          { ...feedRow, isCompleted: true, completedAt: "2026-10-22T08:00:00Z" }
        ]
      }
    });

    const { result } = renderHook(() => useCompleteActivityTask(), {
      wrapper
    });

    await act(async () => {
      result.current.mutate({ id: TASK_ID, isCompleted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith(
      `/crm/activities/tasks/${TASK_ID}/complete`,
      { isCompleted: true },
      { headers: { "X-Timezone": expect.any(String) } }
    );
    expect(
      queryClient.getQueryData<ActivityTaskDetail>(
        crmActivityQueryKeys.TASK_DETAIL(TASK_ID)
      )
    ).toMatchObject({
      isCompleted: true,
      completedAt: "2026-10-22T08:00:00Z"
    });
    expect(queryClient.getQueryState(FEED_KEY)?.isInvalidated).toBe(true);
  });
});
