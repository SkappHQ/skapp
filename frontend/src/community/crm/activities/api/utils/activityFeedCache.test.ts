import {
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import { keepMonthStable, patchTaskInFeedData } from "./activityFeedCache";

const completedRow: ActivityRow = {
  id: 5,
  type: ActivityType.TASK,
  subject: "Update contact details",
  dueAt: "2026-09-15T09:00:00Z",
  occurredAt: null,
  completedAt: "2026-08-12T09:04:00Z",
  isCompleted: true,
  priority: null,
  owner: null,
  contacts: [],
  deal: null,
  company: null,
  canComplete: true
};

describe("keepMonthStable", () => {
  it("keeps the loaded dates when the server value would change the month", () => {
    const patch = keepMonthStable({ isCompleted: false, completedAt: null })(
      completedRow
    );

    expect(patch).toEqual({ isCompleted: false });
  });

  it("applies the server dates when the month stays the same", () => {
    const patch = keepMonthStable({
      isCompleted: true,
      completedAt: "2026-08-20T10:00:00Z"
    })(completedRow);

    expect(patch).toEqual({
      isCompleted: true,
      completedAt: "2026-08-20T10:00:00Z"
    });
  });

  it("never rewrites dates through patchTaskInFeedData", () => {
    const data = {
      pages: [
        {
          overdue: [],
          today: [],
          upcoming: [],
          byMonth: { items: [completedRow], page: 0, hasMore: false }
        }
      ],
      pageParams: [0]
    };

    const patched = patchTaskInFeedData(
      data,
      5,
      keepMonthStable({ isCompleted: false, completedAt: null })
    );

    expect(patched?.pages[0].byMonth.items[0]).toMatchObject({
      isCompleted: false,
      completedAt: "2026-08-12T09:04:00Z"
    });
  });
});
