import { ACCRUAL_PREVIEW_ROW_LIMIT } from "~community/leave/constants/leavePolicyConstants";
import {
  AccrualFrequency,
  AccrualTiming,
  FirstAccrualType,
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

import { buildAccrualPreview } from "../accrualPreviewUtils";

const basePolicy = (
  overrides: Partial<LeavePolicyType> = {}
): LeavePolicyType => ({
  id: 1,
  name: "Test Policy",
  leaveTypeId: 1,
  leaveTypeName: "Annual",
  leaveTypeEmoji: null,
  policyType: PolicyType.ACCRUAL,
  status: LeavePolicyStatus.ACTIVE,
  assignedEmployeeCount: 0,
  accrualDays: 2,
  frequency: AccrualFrequency.MONTHLY,
  waitingPeriodDays: null,
  accrualCapDays: null,
  isCarryoverEnabled: false,
  carryoverExpiryDate: null,
  maxCarryoverDays: null,
  firstAccrual: FirstAccrualType.FULL,
  accrualTiming: AccrualTiming.PERIOD_END,
  ...overrides
});

describe("buildAccrualPreview", () => {
  it("returns no rows when frequency is missing or accrualDays is not positive", () => {
    expect(
      buildAccrualPreview(basePolicy({ frequency: null }), "2024-01-01")
    ).toEqual([]);
    expect(
      buildAccrualPreview(basePolicy({ accrualDays: 0 }), "2024-01-01")
    ).toEqual([]);
  });

  it("returns no rows for an invalid start date", () => {
    expect(buildAccrualPreview(basePolicy(), "not-a-date")).toEqual([]);
  });

  it("accrues accrualDays each period and runs a cumulative balance", () => {
    const rows = buildAccrualPreview(basePolicy(), "2024-01-01");

    // Monthly period-ends within the (carry-over off) start year, truncated by
    // ACCRUAL_PREVIEW_ROW_LIMIT before the year boundary is reached.
    expect(rows).toHaveLength(ACCRUAL_PREVIEW_ROW_LIMIT);
    expect(rows[0].days).toBe(2);
    expect(rows[0].balance).toBe(2);
    expect(rows[rows.length - 1].balance).toBe(2 * ACCRUAL_PREVIEW_ROW_LIMIT);
  });

  it("caps the running balance at accrualCapDays and stops", () => {
    const rows = buildAccrualPreview(
      basePolicy({ accrualCapDays: 5 }),
      "2024-01-01"
    );

    expect(rows).toHaveLength(3);
    expect(rows[rows.length - 1].balance).toBe(5);
  });

  it("stops at the accrual year when carry-over is disabled, continues when enabled", () => {
    const quarterly = { frequency: AccrualFrequency.QUARTERLY };

    const noCarry = buildAccrualPreview(
      basePolicy({ ...quarterly, isCarryoverEnabled: false }),
      "2024-07-01"
    );
    const withCarry = buildAccrualPreview(
      basePolicy({ ...quarterly, isCarryoverEnabled: true }),
      "2024-07-01"
    );

    expect(noCarry).toHaveLength(2);
    expect(noCarry[noCarry.length - 1].date).toBe("31 Dec 2024");
    expect(withCarry).toHaveLength(ACCRUAL_PREVIEW_ROW_LIMIT);
    expect(withCarry.length).toBeGreaterThan(noCarry.length);
  });

  it("still previews when a waiting period pushes the first accrual into the next year", () => {
    const rows = buildAccrualPreview(
      basePolicy({ waitingPeriodDays: 30, isCarryoverEnabled: false }),
      "2024-12-20"
    );

    expect(rows.length).toBeGreaterThan(0);
  });

  it("prorates the first period for calendar frequencies when firstAccrual is PRORATED", () => {
    const rows = buildAccrualPreview(
      basePolicy({ firstAccrual: FirstAccrualType.PRORATED }),
      "2024-01-15"
    );

    expect(rows[0].days).toBeLessThan(2);
    expect(rows[1].days).toBe(2);
  });

  it("reports days as the change in the half-day-rounded balance", () => {
    // 2.4 days/month prorated over 23-31 Aug rounds down to a 0.5 balance, so the
    // days column must say 0.5 too rather than the raw two-decimal accrual.
    const rows = buildAccrualPreview(
      basePolicy({
        accrualDays: 2.4,
        firstAccrual: FirstAccrualType.PRORATED,
        isCarryoverEnabled: true
      }),
      "2026-08-23"
    );

    expect(rows[0]).toEqual({
      date: "31 Aug 2026",
      days: 0.5,
      balance: 0.5
    });
  });

  it("keeps the days column summing to the balance on every row", () => {
    const rows = buildAccrualPreview(
      basePolicy({
        accrualDays: 2.4,
        firstAccrual: FirstAccrualType.PRORATED,
        isCarryoverEnabled: true
      }),
      "2026-08-23"
    );

    let runningTotal = 0;
    rows.forEach((row) => {
      expect(row.days * 2).toBe(Math.round(row.days * 2));
      runningTotal += row.days;
      expect(runningTotal).toBe(row.balance);
    });
  });

  it("prorates the first period for every frequency, not just calendar ones", () => {
    // Half of a 1-15 window, so half of the 2 days.
    const twiceAMonth = buildAccrualPreview(
      basePolicy({
        frequency: AccrualFrequency.TWICE_A_MONTH,
        firstAccrual: FirstAccrualType.PRORATED,
        isCarryoverEnabled: true
      }),
      "2026-01-08"
    );
    expect(twiceAMonth[0]).toEqual({
      date: "15 Jan 2026",
      days: 1,
      balance: 1
    });

    // 11 of the fortnight's 14 days are covered, so 2 * 11/14 rounds to 1.5.
    const fortnightly = buildAccrualPreview(
      basePolicy({
        frequency: AccrualFrequency.EVERY_OTHER_WEEK,
        firstAccrual: FirstAccrualType.PRORATED,
        isCarryoverEnabled: true
      }),
      "2026-01-15"
    );
    expect(fortnightly[0]).toEqual({
      date: "25 Jan 2026",
      days: 1.5,
      balance: 1.5
    });
  });

  it("gives a full first period when the effective date opens the window", () => {
    const rows = buildAccrualPreview(
      basePolicy({
        firstAccrual: FirstAccrualType.PRORATED,
        isCarryoverEnabled: true
      }),
      "2026-08-01"
    );

    expect(rows[0]).toEqual({ date: "31 Aug 2026", days: 2, balance: 2 });
    expect(rows[1]).toEqual({ date: "30 Sep 2026", days: 2, balance: 4 });
  });

  it("credits the window start or end according to accrualTiming", () => {
    const atPeriodEnd = buildAccrualPreview(
      basePolicy({
        accrualTiming: AccrualTiming.PERIOD_END,
        isCarryoverEnabled: true
      }),
      "2026-08-23"
    );
    const atPeriodStart = buildAccrualPreview(
      basePolicy({
        accrualTiming: AccrualTiming.PERIOD_START,
        isCarryoverEnabled: true
      }),
      "2026-08-23"
    );

    expect(atPeriodEnd[0].date).toBe("31 Aug 2026");
    // Clamped to the effective date instead of the 01 Aug window start, then the
    // later periods credit on their real start date.
    expect(atPeriodStart[0].date).toBe("23 Aug 2026");
    expect(atPeriodStart[1].date).toBe("01 Sep 2026");
  });

  it("anchors ON_ANNIVERSARY windows to the effective date, not the calendar year", () => {
    const rows = buildAccrualPreview(
      basePolicy({
        frequency: AccrualFrequency.ON_ANNIVERSARY,
        accrualTiming: AccrualTiming.PERIOD_START,
        isCarryoverEnabled: true
      }),
      "2026-08-23"
    );

    expect(rows[0].date).toBe("23 Aug 2026");
    expect(rows[1].date).toBe("23 Aug 2027");
  });
});
