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
  accrualDays: 2,
  frequency: AccrualFrequency.MONTHLY,
  waitingPeriodDays: null,
  accrualCapDays: null,
  isCarryoverEnabled: false,
  carryoverDate: null,
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

    // Twelve monthly period-ends, all within the (carry-over off) start year.
    expect(rows).toHaveLength(12);
    expect(rows[0].days).toBe(2);
    expect(rows[0].balance).toBe(2);
    expect(rows[11].balance).toBe(24);
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
    const noCarry = buildAccrualPreview(
      basePolicy({ isCarryoverEnabled: false }),
      "2024-07-01"
    );
    const withCarry = buildAccrualPreview(
      basePolicy({ isCarryoverEnabled: true }),
      "2024-07-01"
    );

    // Jul..Dec 2024 only.
    expect(noCarry).toHaveLength(6);
    // Runs into the next year, bounded only by the preview row limit.
    expect(withCarry).toHaveLength(12);
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

  it("does not prorate interval frequencies even when firstAccrual is PRORATED", () => {
    const rows = buildAccrualPreview(
      basePolicy({
        frequency: AccrualFrequency.EVERY_OTHER_WEEK,
        firstAccrual: FirstAccrualType.PRORATED
      }),
      "2024-01-01"
    );

    expect(rows[0].days).toBe(2);
  });
});
