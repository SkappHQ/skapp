import { getNewPendingLeaveRequestCount } from "~community/leave/utils/dashboardUtils";

describe("getNewPendingLeaveRequestCount", () => {
  it("returns the requests that arrived since the pending leaves were last viewed", () => {
    expect(getNewPendingLeaveRequestCount(5, 3)).toBe(2);
  });

  it("returns every pending request when none have been viewed yet", () => {
    expect(getNewPendingLeaveRequestCount(4, 0)).toBe(4);
  });

  it("returns zero when every pending request has been viewed", () => {
    expect(getNewPendingLeaveRequestCount(3, 3)).toBe(0);
  });

  it("returns zero when fewer requests are pending than were viewed", () => {
    expect(getNewPendingLeaveRequestCount(1, 3)).toBe(0);
  });

  it("returns zero when there are no pending requests", () => {
    expect(getNewPendingLeaveRequestCount(0, 0)).toBe(0);
  });

  it("returns zero while the pending count is still loading", () => {
    expect(getNewPendingLeaveRequestCount(undefined, 2)).toBe(0);
  });
});
