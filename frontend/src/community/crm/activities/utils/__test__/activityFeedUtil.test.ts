import crmModule from "~community/common/assets/languages/english/crmModule.json";
import feedMock from "~community/crm/activities/__mocks__/activityFeedMock.json";
import nextPageMock from "~community/crm/activities/__mocks__/activityFeedNextPageMock.json";
import {
  ActivityBucket,
  ActivityFeedResponse,
  ActivityRow,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import {
  countBucketRows,
  formatMonthHeading,
  fromPickerDateRange,
  getActivityRowKey,
  getLinkLabel,
  getMonthAnchor,
  getRowSubtitle,
  getVisibleBuckets,
  groupByMonth,
  isDateRangeEmpty,
  toPickerDateRange,
  validateDateRange
} from "../activityFeedUtil";

type TranslationNode = string | { [key: string]: TranslationNode };

const translate = (keys: string[], values: Record<string, string> = {}) => {
  const template = keys.reduce<TranslationNode>(
    (node, key) => (typeof node === "string" ? node : node[key]),
    crmModule.activities as TranslationNode
  );

  return String(template).replace(
    /{{(\w+)}}/g,
    (_, name: string) => values[name] ?? ""
  );
};

const firstPage = feedMock as ActivityFeedResponse;
const secondPage = nextPageMock as ActivityFeedResponse;

const buildRow = (overrides: Partial<ActivityRow>): ActivityRow => ({
  id: 1,
  type: ActivityType.CALL,
  subject: "Subject",
  dueAt: null,
  occurredAt: null,
  completedAt: null,
  isCompleted: false,
  priority: null,
  owner: null,
  contacts: [],
  deal: null,
  company: null,
  canComplete: false,
  ...overrides
});

const buildPage = (
  items: ActivityRow[],
  page: number,
  hasMore: boolean
): ActivityFeedResponse => ({
  overdue: [],
  today: [],
  upcoming: [],
  byMonth: { items, page, hasMore }
});

describe("getActivityRowKey", () => {
  it("combines type and id so ids from different tables do not clash", () => {
    expect(getActivityRowKey(buildRow({ id: 7, type: ActivityType.TASK }))).toBe(
      "TASK-7"
    );
    expect(getActivityRowKey(buildRow({ id: 7, type: ActivityType.CALL }))).toBe(
      "CALL-7"
    );
  });
});

describe("getMonthAnchor", () => {
  it("uses the completion date for a completed task", () => {
    const row = buildRow({
      type: ActivityType.TASK,
      isCompleted: true,
      dueAt: "2026-11-02T09:00:00Z",
      completedAt: "2026-10-12T09:00:00Z"
    });

    expect(getMonthAnchor(row)).toBe("2026-10-12T09:00:00Z");
  });

  it("uses when it happened for a logged activity", () => {
    expect(
      getMonthAnchor(buildRow({ occurredAt: "2026-09-01T09:00:00Z" }))
    ).toBe("2026-09-01T09:00:00Z");
  });

  it("falls back to the due date", () => {
    expect(getMonthAnchor(buildRow({ dueAt: "2026-08-01T09:00:00Z" }))).toBe(
      "2026-08-01T09:00:00Z"
    );
  });

  it("returns null when there is no date", () => {
    expect(getMonthAnchor(buildRow({}))).toBeNull();
  });
});

describe("groupByMonth", () => {
  it("returns no groups for no pages", () => {
    expect(groupByMonth([], "UTC")).toEqual([]);
  });

  it("groups rows from all loaded pages, newest month first", () => {
    const groups = groupByMonth([firstPage, secondPage], "UTC");

    expect(groups.map((group) => group.monthKey)).toEqual([
      "2026-10",
      "2026-09",
      "2026-08"
    ]);
  });

  it("merges a month that is split across pages", () => {
    const groups = groupByMonth([firstPage, secondPage], "UTC");
    const september = groups.find((group) => group.monthKey === "2026-09");

    expect(september?.rows.map(getActivityRowKey)).toEqual([
      "CALL-95",
      "TASK-5"
    ]);
  });

  it("orders rows newest first within a month", () => {
    const pages = [
      buildPage(
        [buildRow({ id: 1, occurredAt: "2026-10-01T09:00:00Z" })],
        0,
        true
      ),
      buildPage(
        [buildRow({ id: 2, occurredAt: "2026-10-20T09:00:00Z" })],
        1,
        false
      )
    ];

    expect(groupByMonth(pages, "UTC")[0].rows.map((row) => row.id)).toEqual([
      2, 1
    ]);
  });

  it("drops a row that appears on more than one page", () => {
    const row = buildRow({ id: 3, occurredAt: "2026-10-01T09:00:00Z" });
    const groups = groupByMonth(
      [buildPage([row], 0, true), buildPage([row], 1, false)],
      "UTC"
    );

    expect(groups[0].rows).toHaveLength(1);
  });

  it("skips rows without a date", () => {
    expect(groupByMonth([buildPage([buildRow({})], 0, false)], "UTC")).toEqual(
      []
    );
  });

  it("keys the month in the viewer's timezone", () => {
    const row = buildRow({ occurredAt: "2026-09-30T20:00:00Z" });

    expect(
      groupByMonth([buildPage([row], 0, false)], "Asia/Colombo")[0].monthKey
    ).toBe("2026-10");
    expect(groupByMonth([buildPage([row], 0, false)], "UTC")[0].monthKey).toBe(
      "2026-09"
    );
  });
});

describe("getVisibleBuckets", () => {
  it("returns nothing when no page is loaded", () => {
    expect(getVisibleBuckets([], "UTC")).toEqual([]);
  });

  it("renders the fixed buckets in order, then months", () => {
    const groups = getVisibleBuckets([firstPage, secondPage], "UTC");

    expect(groups.map((group) => group.id)).toEqual([
      "overdue",
      "today",
      "upcoming",
      "month-2026-10",
      "month-2026-09",
      "month-2026-08"
    ]);
    expect(groups[3].bucket).toBe(ActivityBucket.BY_MONTH);
    expect(groups[0].monthKey).toBeNull();
  });

  it("hides empty buckets", () => {
    const page = buildPage(
      [buildRow({ occurredAt: "2026-10-01T09:00:00Z" })],
      0,
      false
    );

    expect(getVisibleBuckets([page], "UTC").map((group) => group.id)).toEqual([
      "month-2026-10"
    ]);
  });

  it("takes the fixed buckets from the first page only", () => {
    const groups = getVisibleBuckets([secondPage, firstPage], "UTC");

    expect(groups.some((group) => group.bucket === ActivityBucket.OVERDUE)).toBe(
      false
    );
  });

  it("counts rows across visible buckets", () => {
    expect(countBucketRows(getVisibleBuckets([firstPage, secondPage], "UTC"))).toBe(
      13
    );
  });
});

describe("formatMonthHeading", () => {
  it("formats a month key as month and year", () => {
    expect(formatMonthHeading("2026-10")).toBe("October 2026");
  });
});

describe("getRowSubtitle", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the due date for an open task", () => {
    const row = buildRow({
      type: ActivityType.TASK,
      dueAt: "2027-01-08T09:00:00Z"
    });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("Due on 8th Jan");
  });

  it("shows the completion date for a completed task", () => {
    const row = buildRow({
      type: ActivityType.TASK,
      dueAt: "2026-10-30T09:00:00Z",
      isCompleted: true,
      completedAt: "2026-10-02T09:00:00Z"
    });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("Completed on 2nd Oct");
  });

  it("falls back to the due date for a ticked task without a completion date", () => {
    const row = buildRow({
      type: ActivityType.TASK,
      dueAt: "2026-10-23T09:00:00Z",
      isCompleted: true
    });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("Due on 23rd Oct");
  });

  it("returns an empty string for a task without a due date", () => {
    expect(
      getRowSubtitle(buildRow({ type: ActivityType.TASK }), translate, "UTC")
    ).toBe("");
  });

  it("shows the scheduled date for a meeting still ahead", () => {
    const row = buildRow({
      type: ActivityType.MEETING,
      dueAt: "2026-10-08T10:00:00Z"
    });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("Scheduled on 8th Oct");
  });

  it("shows date and time for a scheduled meeting that has passed", () => {
    const row = buildRow({
      type: ActivityType.MEETING,
      dueAt: "2026-09-12T14:34:00Z"
    });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("12th Sept at 2:34 PM");
  });

  it("shows date and time for a logged call", () => {
    const row = buildRow({ occurredAt: "2026-09-12T14:34:00Z" });

    expect(getRowSubtitle(row, translate, "UTC")).toBe("12th Sept at 2:34 PM");
  });

  it("uses the viewer's timezone", () => {
    const row = buildRow({
      type: ActivityType.EMAIL,
      occurredAt: "2026-09-12T14:34:00Z"
    });

    expect(getRowSubtitle(row, translate, "Asia/Colombo")).toBe(
      "12th Sept at 8:04 PM"
    );
  });

  it("returns an empty string for a logged activity without a date", () => {
    expect(getRowSubtitle(buildRow({}), translate, "UTC")).toBe("");
  });
});

describe("getLinkLabel", () => {
  it("returns the name of a live record", () => {
    expect(
      getLinkLabel({ id: 1, name: "Nimal Silva", deleted: false }, translate)
    ).toBe("Nimal Silva");
  });

  it("marks a deleted record", () => {
    expect(
      getLinkLabel({ id: 1, name: "Nimal Silva", deleted: true }, translate)
    ).toBe("Nimal Silva (deleted)");
  });
});

describe("validateDateRange", () => {
  it("accepts an empty or half-filled range", () => {
    expect(validateDateRange({ from: null, to: null })).toBe(true);
    expect(validateDateRange({ from: "2026-10-01", to: null })).toBe(true);
    expect(validateDateRange({ from: null, to: "2026-10-01" })).toBe(true);
  });

  it("accepts an end date on or after the start date", () => {
    expect(validateDateRange({ from: "2026-10-01", to: "2026-10-01" })).toBe(
      true
    );
    expect(validateDateRange({ from: "2026-10-01", to: "2026-10-05" })).toBe(
      true
    );
  });

  it("rejects an end date before the start date", () => {
    expect(validateDateRange({ from: "2026-10-05", to: "2026-10-01" })).toBe(
      false
    );
  });

  it("rejects dates it cannot read", () => {
    expect(validateDateRange({ from: "bad", to: "2026-10-01" })).toBe(false);
  });
});

describe("date range conversion", () => {
  it("converts to and from the picker's dates", () => {
    const range = { from: "2026-10-01", to: "2026-10-31" };
    const pickerRange = toPickerDateRange(range);

    expect(pickerRange.from?.getDate()).toBe(1);
    expect(pickerRange.to?.getMonth()).toBe(9);
    expect(fromPickerDateRange(pickerRange)).toEqual(range);
  });

  it("leaves out missing dates", () => {
    expect(toPickerDateRange({ from: null, to: null })).toEqual({});
    expect(fromPickerDateRange()).toEqual({ from: null, to: null });
  });

  it("detects an empty range", () => {
    expect(isDateRangeEmpty({ from: null, to: null })).toBe(true);
    expect(isDateRangeEmpty({ from: "2026-10-01", to: null })).toBe(false);
  });
});
