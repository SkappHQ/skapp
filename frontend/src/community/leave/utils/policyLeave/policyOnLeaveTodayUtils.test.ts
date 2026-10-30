import { PolicyOnLeaveTodayStatus } from "~community/leave/enums/PolicyLeaveEnums";
import { PolicyEmployeesOnLeaveType } from "~community/leave/types/PolicyLeaveTypes";

import { getPolicyOnLeaveTodayStatus } from "./policyLeaveUtils";

const buildOnLeaveToday = (
  overrides: Partial<PolicyEmployeesOnLeaveType> = {}
): PolicyEmployeesOnLeaveType => ({
  date: "2025-06-11",
  isNonWorkingDay: false,
  holidays: null,
  onLeaveCount: 2,
  onlineCount: 3,
  ...overrides
});

describe("getPolicyOnLeaveTodayStatus", () => {
  it("returns non-working day when today is a holiday or day off", () => {
    expect(
      getPolicyOnLeaveTodayStatus(
        buildOnLeaveToday({
          isNonWorkingDay: true,
          holidays: [
            {
              id: 1,
              date: "2025-06-11",
              name: "Founders Day",
              holidayDuration: "FULL_DAY"
            }
          ],
          onLeaveCount: null,
          onlineCount: null
        })
      )
    ).toBe(PolicyOnLeaveTodayStatus.NON_WORKING_DAY);
  });

  it("returns no employees when both counts are zero", () => {
    expect(
      getPolicyOnLeaveTodayStatus(
        buildOnLeaveToday({ onLeaveCount: 0, onlineCount: 0 })
      )
    ).toBe(PolicyOnLeaveTodayStatus.NO_EMPLOYEES);
  });

  it("returns all available when nobody is on leave", () => {
    expect(
      getPolicyOnLeaveTodayStatus(buildOnLeaveToday({ onLeaveCount: 0 }))
    ).toBe(PolicyOnLeaveTodayStatus.ALL_AVAILABLE);
  });

  it("returns all away when nobody is online", () => {
    expect(
      getPolicyOnLeaveTodayStatus(buildOnLeaveToday({ onlineCount: 0 }))
    ).toBe(PolicyOnLeaveTodayStatus.ALL_AWAY);
  });

  it("returns partially away when some are on leave and some online", () => {
    expect(getPolicyOnLeaveTodayStatus(buildOnLeaveToday())).toBe(
      PolicyOnLeaveTodayStatus.PARTIALLY_AWAY
    );
  });
});
