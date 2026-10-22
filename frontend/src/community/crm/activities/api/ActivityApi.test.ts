import authFetch from "~community/common/utils/axiosInterceptor";
import activityFeedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import activityTeamMembersMock from "~community/crm/activities/__mocks__/activityTeamMembersMock.json";
import { ActivityTab } from "~community/crm/activities/types/activityTypes";

import { fetchActivityFeed, fetchActivityTeamMembers } from "./ActivityApi";
import { getViewerTimezone } from "./utils/activityFeedParams";

jest.mock("~community/common/utils/axiosInterceptor", () => ({
  __esModule: true,
  default: { get: jest.fn() }
}));

const mockGet = authFetch.get as jest.Mock;

describe("ActivityApi", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("requests the feed with the filters, page and viewer timezone", async () => {
    mockGet.mockResolvedValue({ data: { results: [activityFeedMock] } });
    const controller = new AbortController();

    const result = await fetchActivityFeed(
      {
        tab: ActivityTab.MEETINGS,
        search: "acme",
        ownerId: 4,
        from: "2026-10-01",
        to: "2026-10-31"
      },
      1,
      controller.signal
    );

    expect(result).toEqual(activityFeedMock);
    expect(mockGet).toHaveBeenCalledWith("/crm/activities", {
      params: {
        page: 1,
        type: "MEETING",
        search: "acme",
        ownerId: 4,
        from: "2026-10-01",
        to: "2026-10-31"
      },
      headers: { "X-Timezone": getViewerTimezone() },
      signal: controller.signal
    });
  });

  it("requests the All tab without a type", async () => {
    mockGet.mockResolvedValue({ data: { results: [activityFeedMock] } });

    await fetchActivityFeed(
      { tab: ActivityTab.ALL, search: "", ownerId: null, from: null, to: null },
      0
    );

    expect(mockGet.mock.calls[0][1].params).toEqual({ page: 0 });
  });

  it("returns the full team members list", async () => {
    mockGet.mockResolvedValue({ data: { results: activityTeamMembersMock } });

    await expect(fetchActivityTeamMembers()).resolves.toEqual(
      activityTeamMembersMock
    );
    expect(mockGet).toHaveBeenCalledWith("/crm/activities/team-members");
  });

  it("returns an empty team list when the response has no results", async () => {
    mockGet.mockResolvedValue({ data: {} });

    await expect(fetchActivityTeamMembers()).resolves.toEqual([]);
  });
});
