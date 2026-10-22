import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import authFetch from "~community/common/utils/axiosInterceptor";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import { crmActivityQueryKeys } from "~community/crm/activities/api/utils/QueryKeys";
import { ActivityFeedCacheData } from "~community/crm/activities/api/utils/activityFeedCache";
import {
  ActivityFeedResponse,
  ActivityTab
} from "~community/crm/activities/types/activityTypes";

import { useCompleteActivityTask } from "./ActivityTaskApi";

jest.mock("~community/common/utils/axiosInterceptor", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() }
}));

const mockPatch = authFetch.patch as jest.Mock;

const feedPage = activityFeedMock as ActivityFeedResponse;

const FEED_KEY = crmActivityQueryKeys.FEED({
  tab: ActivityTab.ALL,
  search: "",
  ownerId: null,
  from: null,
  to: null
});

describe("useCompleteActivityTask", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends the target state and marks the feed stale", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    queryClient.setQueryData<ActivityFeedCacheData>(FEED_KEY, {
      pages: [feedPage],
      pageParams: [0]
    });
    const row = { ...feedPage.today[0], isCompleted: true };
    mockPatch.mockResolvedValue({ data: { results: [row] } });

    const { result } = renderHook(() => useCompleteActivityTask(), { wrapper });

    await act(async () => {
      result.current.mutate({ id: 701, isCompleted: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockPatch).toHaveBeenCalledWith(
      "/crm/activities/tasks/701/complete",
      { isCompleted: true },
      { headers: { "X-Timezone": expect.any(String) } }
    );
    expect(queryClient.getQueryState(FEED_KEY)?.isInvalidated).toBe(true);
  });
});
