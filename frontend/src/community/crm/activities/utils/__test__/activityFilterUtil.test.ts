import teamMembersMock from "~community/crm/activities/__mocks__/activityTeamMembersMock.json";
import { EMPTY_ACTIVITY_FILTERS } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityDatePreset,
  ActivityTeamMember
} from "~community/crm/activities/types/activityTypes";

import {
  areFilterValuesEqual,
  filterTeamMembers,
  getMatchingPreset,
  getPresetDateRange,
  hasActiveFilters,
  isSameDateRange
} from "../activityFilterUtil";

const teamMembers = teamMembersMock as ActivityTeamMember[];

describe("getPresetDateRange", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-22T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("covers today only", () => {
    expect(getPresetDateRange(ActivityDatePreset.TODAY, "UTC")).toEqual({
      from: "2026-10-22",
      to: "2026-10-22"
    });
  });

  it("covers Monday to Sunday of the current week", () => {
    expect(getPresetDateRange(ActivityDatePreset.THIS_WEEK, "UTC")).toEqual({
      from: "2026-10-19",
      to: "2026-10-25"
    });
  });

  it("covers the whole current month", () => {
    expect(getPresetDateRange(ActivityDatePreset.THIS_MONTH, "UTC")).toEqual({
      from: "2026-10-01",
      to: "2026-10-31"
    });
  });

  it("covers the last 30 days including today", () => {
    expect(getPresetDateRange(ActivityDatePreset.LAST_30_DAYS, "UTC")).toEqual(
      {
        from: "2026-09-23",
        to: "2026-10-22"
      }
    );
  });

  it("uses the viewer's timezone to decide what today is", () => {
    jest.setSystemTime(new Date("2026-10-22T20:00:00Z"));

    expect(getPresetDateRange(ActivityDatePreset.TODAY, "Asia/Colombo")).toEqual(
      { from: "2026-10-23", to: "2026-10-23" }
    );
  });
});

describe("getMatchingPreset", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-22T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("finds the preset that produced a range", () => {
    expect(
      getMatchingPreset({ from: "2026-10-01", to: "2026-10-31" }, "UTC")
    ).toBe(ActivityDatePreset.THIS_MONTH);
    expect(
      getMatchingPreset({ from: "2026-10-22", to: "2026-10-22" }, "UTC")
    ).toBe(ActivityDatePreset.TODAY);
  });

  it("returns null for a custom or partial range", () => {
    expect(
      getMatchingPreset({ from: "2026-10-02", to: "2026-10-03" }, "UTC")
    ).toBeNull();
    expect(getMatchingPreset({ from: "2026-10-22", to: null }, "UTC")).toBeNull();
  });
});

describe("isSameDateRange", () => {
  it("compares both ends", () => {
    expect(
      isSameDateRange(
        { from: "2026-10-01", to: "2026-10-02" },
        { from: "2026-10-01", to: "2026-10-02" }
      )
    ).toBe(true);
    expect(
      isSameDateRange(
        { from: "2026-10-01", to: "2026-10-02" },
        { from: "2026-10-01", to: null }
      )
    ).toBe(false);
  });
});

describe("areFilterValuesEqual", () => {
  it("compares the owner and the date range", () => {
    expect(
      areFilterValuesEqual(EMPTY_ACTIVITY_FILTERS, {
        ownerId: null,
        dateRange: { from: null, to: null }
      })
    ).toBe(true);
    expect(
      areFilterValuesEqual(EMPTY_ACTIVITY_FILTERS, {
        ...EMPTY_ACTIVITY_FILTERS,
        ownerId: 2
      })
    ).toBe(false);
    expect(
      areFilterValuesEqual(EMPTY_ACTIVITY_FILTERS, {
        ...EMPTY_ACTIVITY_FILTERS,
        dateRange: { from: "2026-10-01", to: null }
      })
    ).toBe(false);
  });
});

describe("hasActiveFilters", () => {
  it("is false for the default filters", () => {
    expect(hasActiveFilters(EMPTY_ACTIVITY_FILTERS)).toBe(false);
  });

  it("is true when an owner or a date is set", () => {
    expect(hasActiveFilters({ ...EMPTY_ACTIVITY_FILTERS, ownerId: 1 })).toBe(
      true
    );
    expect(
      hasActiveFilters({
        ...EMPTY_ACTIVITY_FILTERS,
        dateRange: { from: null, to: "2026-10-01" }
      })
    ).toBe(true);
  });
});

describe("filterTeamMembers", () => {
  it("returns everyone for an empty search", () => {
    expect(filterTeamMembers(teamMembers, "  ")).toHaveLength(3);
  });

  it("matches names case-insensitively", () => {
    expect(
      filterTeamMembers(teamMembers, "SAM").map((member) => member.id)
    ).toEqual([2]);
  });

  it("returns nothing when no name matches", () => {
    expect(filterTeamMembers(teamMembers, "zzz")).toEqual([]);
  });
});
